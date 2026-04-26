import React, { useEffect, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus, cancelRideRequest, findActiveRideId } from '../services/api';

export const Searching = ({ setCurrentScreen, currentRideId, setCurrentRideId }) => {
  const [loading, setLoading] = useState(false);
  const [resolvedRideId, setResolvedRideId] = useState(currentRideId || null);

  useEffect(() => {
    if (currentRideId) {
      setResolvedRideId(currentRideId);
    }
  }, [currentRideId]);

  useEffect(() => {
    let statusPollingInterval;
    let rideIdRecoveryInterval;
    let isMounted = true;

    const tryRecoverRideId = async () => {
      if (resolvedRideId) return;
      try {
        const recoveredRideId = await findActiveRideId();
        if (isMounted && recoveredRideId) {
          setResolvedRideId(recoveredRideId);
          if (setCurrentRideId) {
            setCurrentRideId(recoveredRideId);
          }
        }
      } catch (err) {
        console.error('Ride ID recovery error:', err);
      }
    };

    const pollStatus = async () => {
      if (!resolvedRideId) return;
      try {
        const rideData = await getRideStatus(resolvedRideId);
        console.log('Poll response:', rideData);
        const currentStatus = rideData.Status || rideData.status;
        if (isMounted && (currentStatus === 'accepted' || currentStatus === 'Accepted' || currentStatus === 'driver_assigned' || currentStatus === 'in_progress')) {
          clearInterval(statusPollingInterval);
          setCurrentScreen('driver-arrived');
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    if (resolvedRideId) {
      statusPollingInterval = setInterval(pollStatus, 3000);
      pollStatus();
    } else {
      rideIdRecoveryInterval = setInterval(tryRecoverRideId, 3000);
      tryRecoverRideId();
    }

    return () => {
      isMounted = false;
      if (statusPollingInterval) clearInterval(statusPollingInterval);
      if (rideIdRecoveryInterval) clearInterval(rideIdRecoveryInterval);
    };
  }, [setCurrentScreen, resolvedRideId, setCurrentRideId]);

  const handleCancel = async () => {
    if (!resolvedRideId) {
      setCurrentScreen('home');
      return;
    }
    setLoading(true);
    try {
      await cancelRideRequest(resolvedRideId);
      setLoading(false);
      setCurrentScreen('home');
    } catch (error) {
      console.error("Failed to cancel ride:", error);
      alert("Failed to cancel the ride. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <MapPlaceholder>
      <div className="overlay-drawer text-center">
        <div className="py-4 bg-light rounded-3 mb-4">
          <span className="text-dark">
            {resolvedRideId ? 'Looking for nearby drivers...' : 'Request sent. Finding your ride...'}
          </span>
        </div>

        <button
          className="btn btn-safar-danger w-100 rounded-pill py-3"
          onClick={handleCancel}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Canceling...' : 'Cancel Ride'}
        </button>
      </div>
    </MapPlaceholder>
  );
};
