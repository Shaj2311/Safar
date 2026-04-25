import React, { useEffect, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus, getDriverProfile } from '../services/api';

export const DriverArrived = ({ setCurrentScreen, onMenuClick, currentRideId }) => {
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    let pollingInterval;
    let isMounted = true;

    const pollAndFetchDriver = async () => {
      if (!currentRideId) return;
      try {
        const rideData = await getRideStatus(currentRideId);
        const currentStatus = rideData.Status || rideData.status;
        if (isMounted && (currentStatus === 'completed' || currentStatus === 'Completed')) {
          clearInterval(pollingInterval);
          setCurrentScreen('trip-completed');
          return;
        }
        if (isMounted && rideData.driver_id && !driver) {
          const profileData = await getDriverProfile(rideData.driver_id);
          setDriver(profileData);
        }
      } catch (err) {
        console.error("Error polling driver status:", err);
      }
    };

    if (currentRideId) {
      pollAndFetchDriver();
      pollingInterval = setInterval(pollAndFetchDriver, 3000);
    } else {
      // Local testing fallback
      setTimeout(() => {
        if (isMounted) setCurrentScreen('trip-completed');
      }, 5000);
    }

    return () => {
      isMounted = false;
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [currentRideId, setCurrentScreen, driver]);

  return (
    <div className="w-100 h-100 d-flex flex-column">
      <MapPlaceholder onMenuClick={(e) => { e.stopPropagation(); onMenuClick && onMenuClick(e); }}>
        <div className="overlay-drawer text-center p-4" onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <div className="bg-secondary rounded-circle me-3" style={{ width: '60px', height: '60px', opacity: 0.3 }}></div>
              <div className="text-start">
                {driver ? (
                  <>
                    <h4 className="mb-0 fw-bold">{driver.name || 'Driver'}</h4>
                    <small className="text-muted">
                      {driver.vehicle_make || 'Car'} {driver.vehicle_model || ''} • {driver.plate_no || 'Pending'}
                    </small>
                  </>
                ) : (
                  <>
                    <h4 className="mb-0 fw-bold">Loading...</h4>
                    <small className="text-muted">Fetching driver details</small>
                  </>
                )}
              </div>
            </div>
            <div className="text-success small fw-bold">ETA: 5 mins</div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-safar-primary flex-grow-1 rounded-pill py-3"
              onClick={(e) => { e.stopPropagation(); console.log('Calling driver...'); }}
            >
              Call Driver
            </button>
            <button
              className="btn btn-secondary rounded-pill py-3 px-4"
              onClick={(e) => { e.stopPropagation(); setCurrentScreen('trip-completed'); }}
            >
              Skip
            </button>
          </div>
        </div>
      </MapPlaceholder>
    </div>
  );
};
