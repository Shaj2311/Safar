import React, { useEffect, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus, cancelRideRequest } from '../services/api';

export const Searching = ({ setCurrentScreen, currentRideId }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let pollingInterval;
    let isMounted = true;

    const pollStatus = async () => {
      if (!currentRideId) return;
      try {
        const rideData = await getRideStatus(currentRideId);
        console.log('Poll response:', rideData);
        const currentStatus = rideData.Status || rideData.status;
        if (isMounted && (currentStatus === 'accepted' || currentStatus === 'Accepted' || currentStatus === 'driver_assigned' || currentStatus === 'in_progress')) {
          clearInterval(pollingInterval);
          setCurrentScreen('driver-arrived');
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    if (currentRideId) {
      pollingInterval = setInterval(pollStatus, 3000);
      pollStatus();
    } else {
      // Agar API connect nahi hui toh 3 second baad directly driver arrived dikha do (testing purpose)
      pollingInterval = setTimeout(() => {
        if (isMounted) setCurrentScreen('driver-arrived');
      }, 3000);
    }

    return () => {
      isMounted = false;
      if (currentRideId) {
        clearInterval(pollingInterval);
      } else {
        clearTimeout(pollingInterval);
      }
    };
  }, [setCurrentScreen, currentRideId]);

  const handleCancel = async () => {
    if (!currentRideId) {
      setCurrentScreen('home');
      return;
    }
    setLoading(true);
    try {
      await cancelRideRequest(currentRideId);
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
          <span className="text-dark">Looking for nearby drivers...</span>
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
