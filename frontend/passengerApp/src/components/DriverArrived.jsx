import React, { useEffect, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus, getDriverProfile } from '../services/api';

export const DriverArrived = ({ setCurrentScreen, onMenuClick, currentRideId }) => {
  const [driver, setDriver] = useState(null);
  const [rideData, setRideData] = useState(null);

  useEffect(() => {
    let pollingInterval;
    let isMounted = true;

    const pollAndFetchDriver = async () => {
      if (!currentRideId) return;
      try {
        const data = await getRideStatus(currentRideId);
        setRideData(data);
        const currentStatus = data.Status || data.status;
        
        if (isMounted && (currentStatus === 'completed' || currentStatus === 'Completed')) {
          clearInterval(pollingInterval);
          setCurrentScreen('trip-completed');
          return;
        }

        // Fetch driver profile only once we have the driver_id
        if (isMounted && data.driver_id && !driver) {
          const profileData = await getDriverProfile(data.driver_id);
          setDriver(profileData);
        }
      } catch (err) {
        console.error("Error polling driver status:", err);
      }
    };

    if (currentRideId) {
      pollAndFetchDriver();
      pollingInterval = setInterval(pollAndFetchDriver, 3000);
    }

    return () => {
      isMounted = false;
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [currentRideId, setCurrentScreen, driver]);

  const handleCallDriver = (e) => {
    e.stopPropagation();
    if (driver && (driver.phoneNo || driver.phone)) {
      window.location.href = `tel:${driver.phoneNo || driver.phone}`;
    } else {
      alert("Driver phone number not available.");
    }
  };

  return (
    <div className="w-100 h-100 d-flex flex-column">
      <MapPlaceholder onMenuClick={(e) => { e.stopPropagation(); onMenuClick && onMenuClick(e); }}>
        <div className="overlay-drawer text-center p-4" onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>
          
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              {/* Profile Image / Placeholder */}
              <div className="bg-light rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-person-fill text-secondary fs-2"></i>
              </div>
              
              <div className="text-start">
                {driver ? (
                  <>
                    <h4 className="mb-0 fw-bold">{driver.name || 'Your Driver'}</h4>
                    <div className="text-muted small d-flex flex-column">
                      <span>{driver.vehicle_make || 'Car'} {driver.vehicle_model || ''}</span>
                      <span className="fw-bold text-dark">{driver.plate_no || 'No Plate'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="mb-0 fw-bold text-muted">Finding Driver...</h4>
                    <small className="text-muted italic">Updating details</small>
                  </>
                )}
              </div>
            </div>

            {/* Dynamic ETA (Only shown if driver profile loaded) */}
            {driver && (
              <div className="text-success small fw-bold text-end">
                <div className="mb-0" style={{ fontSize: '0.7rem', color: '#999', fontWeight: 'normal' }}>ETA</div>
                <div>5-8 mins</div>
              </div>
            )}
          </div>

          <div className="d-flex flex-column gap-2">
            <button
              className="btn btn-safar-primary w-100 rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
              onClick={handleCallDriver}
              disabled={!driver}
              style={{ opacity: driver ? 1 : 0.6 }}
            >
              <i className="bi bi-telephone-fill me-2"></i>
              Call Driver
            </button>
            <p className="text-muted small mt-2 mb-0">Safety first: Wear your seatbelt</p>
          </div>

        </div>
      </MapPlaceholder>
    </div>
  );
};
