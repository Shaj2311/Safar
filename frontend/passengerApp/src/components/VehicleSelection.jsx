import React, { useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { createRideRequest } from '../services/api';

export const VehicleSelection = ({ setCurrentScreen, onMenuClick, setCurrentRideId }) => {
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = [
    { id: 'mini', name: 'Safar Mini', price: 'Rs. 450', icon: 'bi-car-front-fill' },
    { id: 'auto', name: 'Safar Auto', price: 'Rs. 200', icon: 'bi-taxi-front-fill' },
    { id: 'bike', name: 'Safar Bike', price: 'Rs. 150', icon: 'bi-bicycle' }
  ];

  const handleConfirmRide = async () => {
    if (!activeVehicle) return;
    setLoading(true);
    try {
      // Asal map integration abhi baqi hai, is liye fake coordinates bhej rahe hain testing ke liye
      const response = await createRideRequest({
        pickup_x: 31.5204,
        pickup_y: 74.3587,
        dropoff_x: 31.4504,
        dropoff_y: 74.3587
      });
      
      // Backend naya ride banayega aur uska id wapis karega, jo aagay tracking mein use hoga
      if (response && response.id) {
        setCurrentRideId(response.id);
      } else if (response && response.ride_id) {
        setCurrentRideId(response.ride_id);
      }
      
      setLoading(false);
      setCurrentScreen('searching');
    } catch (error) {
      console.error("Failed to create ride:", error);
      alert("Failed to request ride. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <MapPlaceholder onMenuClick={onMenuClick}>
      <div className="overlay-drawer p-0">
        <div className="text-center py-4 fs-4 fw-bold bg-white" style={{ borderTopLeftRadius: '30px', borderTopRightRadius: '30px' }}>
          Choose a ride
        </div>
        
        <div className="bg-light py-2">
            {options.map(option => (
              <div 
                key={option.id}
                className="drawer-item px-4 mx-3 my-2 bg-light rounded"
                style={{ 
                  cursor: 'pointer', 
                  border: activeVehicle === option.id ? '2px solid var(--safar-green)' : '2px solid transparent',
                  padding: '15px 0'
                }}
                onClick={() => setActiveVehicle(option.id)}
              >
                <div className="d-flex align-items-center">
                    <i className={`${option.icon} fs-1 me-4 text-secondary`}></i>
                    <span className="drawer-item-title fw-bold fs-5">{option.name}</span>
                </div>
                <span className="drawer-item-price fw-bold fs-5">{option.price}</span>
              </div>
            ))}
        </div>

        <div className="p-4 bg-white">
            <button 
              className="btn btn-safar-primary w-100 rounded-pill"
              onClick={handleConfirmRide}
              disabled={!activeVehicle || loading}
              style={{ opacity: activeVehicle && !loading ? 1 : 0.5 }}
            >
              {loading ? 'Requesting...' : 'Confirm Ride'}
            </button>
        </div>
      </div>
    </MapPlaceholder>
  );
};
