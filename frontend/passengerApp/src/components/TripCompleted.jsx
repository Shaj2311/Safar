import React, { useEffect, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus, getRideSummary, getRideDetailsByAnyEndpoint } from '../services/api';

const normalizeStatusValue = (status) => String(status || '').trim().toLowerCase().replace(/\s+/g, '_');

const isPaymentConfirmedStatus = (status) => {
  const normalized = normalizeStatusValue(status);
  return [
    'paid',
    'payment_confirmed',
    'paymentconfirmed',
    'confirmed_payment',
    'confirmedpayment'
  ].includes(normalized);
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
    const pollingInterval = setInterval(async () => {
      try {
        const rideData = await getRideStatus(currentRideId);
        const currentStatus = rideData.Status || rideData.status;
        if (isMounted && isPaymentConfirmedStatus(currentStatus)) {
          clearInterval(pollingInterval);
          setWaitingForDriver(false);
        }
      } catch (err) {
        console.error('Payment polling error:', err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
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
