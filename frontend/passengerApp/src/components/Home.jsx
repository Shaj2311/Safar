import React from 'react';
import { MapPlaceholder } from './MapPlaceholder';

export const Home = ({ setCurrentScreen, onMenuClick }) => {
  return (
    <MapPlaceholder onMenuClick={onMenuClick}>
      <div className="overlay-drawer text-center">
        <div className="bg-light p-3 rounded-pill mb-3 d-flex align-items-center justify-content-center" style={{ cursor: 'pointer' }}>
            <span className="fw-bold" style={{ color: '#333333' }}>Current Location</span>
        </div>
        
        <div 
          className="bg-light p-3 rounded-pill mb-4 d-flex align-items-center justify-content-center" 
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentScreen('vehicle-selection')}
        >
            <span className="fw-bold" style={{ color: '#333333' }}>Where To?</span>
        </div>
        
        <button 
          className="btn btn-safar-primary w-100 rounded-pill"
          onClick={() => setCurrentScreen('vehicle-selection')}
        >
          Confirm Ride
        </button>
      </div>
    </MapPlaceholder>
  );
};
