import React, { useEffect } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus } from '../services/api';

export const Searching = ({ setCurrentScreen, currentRideId }) => {
  useEffect(() => {
    let pollingInterval;
    let isMounted = true;
    
    const pollStatus = async () => {
      if (!currentRideId) return;
      try {
        const rideData = await getRideStatus(currentRideId);
        // Agar driver ne ride accept kar li toh screen change kar do
        if (isMounted && (rideData.status === 'accepted' || rideData.status === 'driver_assigned' || rideData.status === 'in_progress')) {
          clearInterval(pollingInterval);
          setCurrentScreen('driver-arrived');
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    if (currentRideId) {
      // Har 3 second baad backend se pucho ke driver mila ya nahi
      pollingInterval = setInterval(pollStatus, 3000);
      pollStatus(); // Pehli dafa foran check karo wait kiye baghair
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

  return (
    <MapPlaceholder>
      <div className="overlay-drawer text-center">
        <div className="py-4 bg-light rounded-3 mb-4">
            <span className="text-dark">Looking for nearby drivers...</span>
        </div>
        
        <button 
          className="btn btn-safar-danger w-100 rounded-pill py-3"
          onClick={() => setCurrentScreen('home')}
        >
          Cancel Ride
        </button>
      </div>
    </MapPlaceholder>
  );
};
