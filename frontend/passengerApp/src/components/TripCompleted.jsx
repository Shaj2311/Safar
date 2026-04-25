import React, { useEffect, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus, getRideSummary } from '../services/api';

export const TripCompleted = ({ setCurrentScreen, onMenuClick, currentRideId }) => {
  const [summary, setSummary] = useState(null);
  const [waitingForDriver, setWaitingForDriver] = useState(true);

  useEffect(() => {
    // Fetch ride summary (fare, distance, etc.) from backend
    if (currentRideId) {
      getRideSummary(currentRideId)
        .then(data => setSummary(data))
        .catch(err => console.error('Could not fetch summary:', err));
    }
  }, [currentRideId]);

  useEffect(() => {
    if (!currentRideId) return;

    let isMounted = true;
    const pollingInterval = setInterval(async () => {
      try {
        const rideData = await getRideStatus(currentRideId);
        const currentStatus = rideData.Status || rideData.status;
        // When driver confirms payment, status changes to 'paid' or 'Paid'
        if (isMounted && (currentStatus === 'paid' || currentStatus === 'Paid')) {
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

  // Display the fare: prefer backend summary, fall back to localStorage calculated fare
  const fareDisplay = summary?.fare
    ? `Rs. ${summary.fare}`
    : summary?.amount
    ? `Rs. ${summary.amount}`
    : '—';

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
