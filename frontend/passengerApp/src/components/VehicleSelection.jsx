import React, { useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { createRideRequest } from '../services/api';

export const VehicleSelection = ({ setCurrentScreen, onMenuClick, setCurrentRideId, pickup, dropoff }) => {
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = [
    { id: 'mini', name: 'Safar Mini', price: 'Rs. 450', icon: 'bi-car-front-fill' },
    { id: 'auto', name: 'Safar Auto', price: 'Rs. 200', icon: 'bi-taxi-front-fill' },
    { id: 'bike', name: 'Safar Bike', price: 'Rs. 150', icon: 'bi-bicycle' }
  ];

  const handleConfirmRide = async () => {
    if (!activeVehicle || !pickup || !dropoff) return;

    setLoading(true);
    try {
      const response = await createRideRequest({
        pickup_x: pickup.lat,
        pickup_y: pickup.lng,
        dropoff_x: dropoff.lat,
        dropoff_y: dropoff.lng
      });

      const rideId = response?.rideId || response?.tripId || response?.id || response?.ride_id || null;
      console.log('Ride created. ID:', rideId, '| Full response:', response);
      if (rideId) setCurrentRideId(rideId);

      setLoading(false);
      setCurrentScreen('searching');
    } catch (error) {
      console.error("Failed to create ride:", error);
      alert("Failed to request ride. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <MapPlaceholder onMenuClick={onMenuClick} pickup={pickup} dropoff={dropoff}>
      <div className="overlay-drawer p-0">
        <div className="text-center py-4 fs-4 fw-bold bg-white" style={{ borderTopLeftRadius: '30px', borderTopRightRadius: '30px' }}>
          Choose a ride
        </div>

        <div className="bg-light py-2">
          {options.map(option => (
            <div
              key={option.id}
              className="drawer-item px-4 mx-3 my-2 bg-light rounded shadow-sm"
              style={{
                cursor: 'pointer',
                border: activeVehicle === option.id ? '3px solid #80CCA5' : '3px solid transparent',
                padding: '15px 0',
                transition: '0.2s all'
              }}
              onClick={() => setActiveVehicle(option.id)}
            >
              <div className="d-flex align-items-center">
                <i className={`${option.icon} fs-1 me-4 ${activeVehicle === option.id ? 'text-dark' : 'text-secondary'}`}></i>
                <span className="drawer-item-title fw-bold fs-5">{option.name}</span>
              </div>
              <span className="drawer-item-price fw-bold fs-5 text-success">{option.price}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white">
          <button
            className="btn w-100 rounded-pill py-3 fw-bold fs-5 text-white"
            onClick={handleConfirmRide}
            disabled={!activeVehicle || loading}
            style={{ backgroundColor: '#80CCA5', opacity: activeVehicle && !loading ? 1 : 0.5 }}
          >
            {loading ? 'Requesting...' : 'Confirm Ride'}
          </button>
        </div>
      </div>
    </MapPlaceholder>
  );
};
