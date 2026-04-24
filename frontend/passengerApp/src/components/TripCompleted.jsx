import React from 'react';
import { MapPlaceholder } from './MapPlaceholder';

export const TripCompleted = ({ setCurrentScreen, onMenuClick }) => {
  return (
    <MapPlaceholder onMenuClick={onMenuClick}>
      <div className="overlay-drawer text-center p-4">
        <h4 className="mb-3 mt-2">Trip Completed!</h4>
        <div className="fs-3 fw-bold mb-4">Rs. 450</div>
        
        <button 
          className="btn btn-safar-primary w-100 rounded-pill py-3"
          onClick={() => setCurrentScreen('rating')}
        >
          Confirm Payment
        </button>
      </div>
    </MapPlaceholder>
  );
};
