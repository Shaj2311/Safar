import React, { useEffect, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideSummary, getRideDetailsByAnyEndpoint, getRidePaymentStatus } from '../services/api';

const normalizeStatusValue = (status) => String(status || '').trim().toLowerCase().replace(/\s+/g, '_');

const normalizeKey = (key) => String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const findFirstValueByKeys = (source, keyNames) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const targetKeys = new Set(keyNames.map((key) => normalizeKey(key)));
  const queue = [source];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (targetKeys.has(normalizeKey(key)) && value !== null && value !== undefined && String(value).trim() !== '') {
        return value;
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return null;
};

const isConfirmedStatusValue = (status) => {
  const normalized = normalizeStatusValue(status);
  return [
    'paid',
    'payment_confirmed',
    'paymentconfirmed',
    'confirmed_payment',
    'confirmedpayment',
    'settled',
    'payment_settled',
    'paymentsettled',
    'success',
  ].includes(normalized);
};

const isTruthyFlag = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = normalizeStatusValue(value);
    return ['true', '1', 'yes'].includes(normalized);
  }

  return false;
};

const isPaymentSettled = (paymentPayload) => {
  if (!paymentPayload || typeof paymentPayload !== 'object') {
    return false;
  }

  const paidFlag = findFirstValueByKeys(paymentPayload, [
    'is_paid',
    'isPaid',
    'paid',
    'payment_paid',
    'paymentPaid',
    'is_settled',
    'isSettled',
    'payment_settled',
    'paymentSettled',
    'settled',
  ]);

  if (paidFlag !== null && paidFlag !== undefined) {
    if (isTruthyFlag(paidFlag)) {
      return true;
    }

    if (typeof paidFlag === 'string' && isConfirmedStatusValue(paidFlag)) {
      return true;
    }
  }

  const paymentStatus = findFirstValueByKeys(paymentPayload, [
    'payment_status',
    'paymentStatus',
    'payment_state',
    'paymentState',
    'status',
  ]);

  return isConfirmedStatusValue(paymentStatus);
};

const extractFareValue = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidateKeys = [
    'fare',
    'amount',
    'price',
    'total_fare',
    'totalFare',
    'trip_fare',
    'tripFare',
    'final_fare',
    'finalFare',
    'payment_amount',
    'paymentAmount'
  ];

  const queue = [payload];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === null || current === undefined) {
      continue;
    }

    if (typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    for (const key of candidateKeys) {
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        const numericValue = Number(current[key]);
        if (!Number.isNaN(numericValue) && Number.isFinite(numericValue) && numericValue >= 0) {
          return Math.round(numericValue);
        }
      }
    }

    for (const value of Object.values(current)) {
      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return null;
};

export const TripCompleted = ({ setCurrentScreen, onMenuClick, currentRideId }) => {
  const [summary, setSummary] = useState(null);
  const [fallbackDetails, setFallbackDetails] = useState(null);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(true);

  useEffect(() => {
    // Fetch ride summary (fare, distance, etc.) from backend
    if (currentRideId) {
      setSummaryLoaded(false);
      setFallbackLoaded(false);

      getRideSummary(currentRideId)
        .then(data => setSummary(data))
        .catch(err => console.error('Could not fetch summary:', err))
        .finally(() => setSummaryLoaded(true));

      getRideDetailsByAnyEndpoint(currentRideId)
        .then(data => setFallbackDetails(data))
        .catch(err => console.error('Could not fetch fallback ride details:', err))
        .finally(() => setFallbackLoaded(true));
    }
  }, [currentRideId]);

  useEffect(() => {
    if (!currentRideId) return;

    let isMounted = true;
    let pollingInterval;

    const pollPaymentStatus = async () => {
      try {
        const paymentPayload = await getRidePaymentStatus(currentRideId);
        if (!isMounted) {
          return false;
        }

        if (isPaymentSettled(paymentPayload)) {
          setWaitingForDriver(false);
          return true;
        }
      } catch (err) {
        console.error('Payment polling error:', err);
      }

      return false;
    };

    const startPolling = async () => {
      const isSettled = await pollPaymentStatus();
      if (isSettled || !isMounted) {
        return;
      }

      pollingInterval = setInterval(async () => {
        const settled = await pollPaymentStatus();
        if (settled && pollingInterval) {
          clearInterval(pollingInterval);
        }
      }, 3000);
    };

    startPolling();

    return () => {
      isMounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [currentRideId]);

  const summaryFare = extractFareValue(summary);
  const fallbackFare = extractFareValue(fallbackDetails);

  const localEstimatedFare = (() => {
    if (!currentRideId) {
      const latestValue = Number(localStorage.getItem('safarEstimatedFare_latest'));
      return Number.isNaN(latestValue) ? null : latestValue;
    }

    const rideSpecificValue = Number(localStorage.getItem(`safarEstimatedFare_${currentRideId}`));
    if (!Number.isNaN(rideSpecificValue)) {
      return rideSpecificValue;
    }

    const latestValue = Number(localStorage.getItem('safarEstimatedFare_latest'));
    return Number.isNaN(latestValue) ? null : latestValue;
  })();

  const canUseLocalFallbackFare = summaryLoaded && fallbackLoaded;
  const resolvedFare = localEstimatedFare ?? summaryFare ?? fallbackFare ?? (canUseLocalFallbackFare ? localEstimatedFare : null);
  const fareDisplay = resolvedFare !== null && resolvedFare !== undefined ? `Rs. ${resolvedFare}` : '—';

  return (
    <MapPlaceholder onMenuClick={onMenuClick}>
      <div className="overlay-drawer text-center p-4">

        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-3 mb-1">Trip Completed!</h4>
          <p className="text-muted small mb-0">Thank you for riding with Safar</p>
        </div>

        <div className="bg-light rounded-3 p-3 mb-4">
          <div className="fs-2 fw-bold text-success">{fareDisplay}</div>
          <div className="text-muted small">Total Fare (Cash)</div>
        </div>

        {waitingForDriver ? (
          <div className="d-flex flex-column align-items-center">
            <div className="spinner-border text-success mb-3" role="status" style={{ width: '1.5rem', height: '1.5rem' }}></div>
            <p className="text-muted small">Waiting for driver to confirm payment...</p>
          </div>
        ) : (
          <button
            className="btn btn-safar-primary w-100 rounded-pill py-3"
            onClick={() => setCurrentScreen('rating')}
          >
            Rate Your Driver
          </button>
        )}

      </div>
    </MapPlaceholder>
  );
};
