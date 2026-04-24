import React, { useEffect } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getNearbyDrivers } from '../services/api';

export const Searching = ({ setCurrentScreen }) => {
  useEffect(() => {
    let searchTimer;
    let isMounted = true;
    
    const searchDrivers = async () => {
      // Simulate API call
      await getNearbyDrivers({ lat: 0, lng: 0 });
      
      // Auto-transition after 3 seconds only if still mounted
      if (isMounted) {
        searchTimer = setTimeout(() => {
          setCurrentScreen('driver-arrived');
        }, 3000);
      }
    };

    searchDrivers();

    return () => {
      isMounted = false;
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [setCurrentScreen]);

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
