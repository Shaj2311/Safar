import React, { useEffect } from 'react';
import { MapPlaceholder } from './MapPlaceholder';

export const DriverArrived = ({ setCurrentScreen, onMenuClick }) => {
  useEffect(() => {
    let timeoutId;
    let isMounted = true;
    
    timeoutId = setTimeout(() => {
      if (isMounted) {
        setCurrentScreen('trip-completed');
      }
    }, 5000);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [setCurrentScreen]);

  return (
    <div onClick={() => setCurrentScreen('trip-completed')} className="w-100 h-100 d-flex flex-column" style={{ cursor: 'pointer' }}>
      <MapPlaceholder onMenuClick={(e) => { e.stopPropagation(); onMenuClick && onMenuClick(e); }}>
        <div className="overlay-drawer text-center p-4" onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center">
                  <div className="bg-secondary rounded-circle me-3" style={{width: '60px', height: '60px', opacity: 0.3}}></div>
                  <div className="text-start">
                      <h4 className="mb-0 fw-bold">Ali</h4>
                      <small className="text-muted">Honda Civic • LE-2026</small>
                  </div>
              </div>
              <div className="text-success small fw-bold">
                  ETA: 5 mins
              </div>
          </div>
          
          <button 
            className="btn btn-safar-primary w-100 rounded-pill py-3"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Calling driver...');
            }}
          >
            Call
          </button>
        </div>
      </MapPlaceholder>
    </div>
  );
};
