import React, { useState, useEffect } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { createRideRequest, extractRideIdFromPayload } from '../services/api';

const getRouteInfo = (pickup, dropoff, callback) => {
  if (!pickup || !dropoff || !window.google) return;
  const service = new window.google.maps.DirectionsService();
  service.route(
    {
      origin: { lat: pickup.lat, lng: pickup.lng },
      destination: { lat: dropoff.lat, lng: dropoff.lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === 'OK') {
        const leg = result.routes[0].legs[0];
        callback({
          distanceText: leg.distance.text,
          distanceKm: leg.distance.value / 1000,
          durationText: leg.duration.text,
        });
      }
    }
  );
};

export const VehicleSelection = ({ setCurrentScreen, onMenuClick, setCurrentRideId, pickup, dropoff }) => {
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isOrderButtonReady, setIsOrderButtonReady] = useState(false);

  useEffect(() => {
    getRouteInfo(pickup, dropoff, (info) => setRouteInfo(info));
  }, [pickup, dropoff]);

  // Prevent accidental tap-through when navigating from Home to this screen.
  useEffect(() => {
    setIsOrderButtonReady(false);
    const timerId = setTimeout(() => setIsOrderButtonReady(true), 500);
    return () => clearTimeout(timerId);
  }, []);

  const fare = routeInfo ? Math.round(routeInfo.distanceKm * 100) : null;

  const handleOrderSafar = async () => {
    if (!isOrderButtonReady || loading) return;
    if (!pickup || !dropoff) return;
    setLoading(true);
    try {
      const response = await createRideRequest({
        pickup_x: pickup.lat,
        pickup_y: pickup.lng,
        dropoff_x: dropoff.lat,
        dropoff_y: dropoff.lng
      });

      const rideId = extractRideIdFromPayload(response);
      
      console.log('--- BACKEND RESPONSE ---');
      console.log(response); 
      console.log('Captured Ride ID:', rideId);
      console.log('------------------------');

      if (rideId) {
        setCurrentRideId(rideId);
      } else {
        console.warn("Warning: Backend did not return a valid Ride ID.");
      }

      setLoading(false);
      setCurrentScreen('searching');
    } catch (error) {
      console.error('Failed to create ride:', error);
      alert('Failed to request ride. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <MapPlaceholder onMenuClick={onMenuClick} pickup={pickup} dropoff={dropoff}>
      <div className="overlay-drawer p-0">

        {/* Header */}
        <div className="text-center py-4 bg-white" style={{ borderTopLeftRadius: '30px', borderTopRightRadius: '30px' }}>
          <h5 className="fw-bold mb-0">Your Safar</h5>
        </div>

        {/* Fare & Info Card */}
        <div className="bg-light px-4 py-4 mx-3 my-3 rounded-3 shadow-sm">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-car-front-fill fs-1 me-3 text-dark"></i>
              <div className="fw-bold fs-5">Safar</div>
            </div>
            <div className="fw-bold fs-5 text-success">
              {fare !== null ? `Rs. ${fare}` : 'Calculating...'}
            </div>
          </div>

          {/* Stats Row */}
          <div className="d-flex justify-content-around pt-3" style={{ borderTop: '1px solid #ddd' }}>
            <div className="text-center">
              <i className="bi bi-geo-alt-fill text-success mb-1 d-block"></i>
              <div className="fw-bold small">{routeInfo ? routeInfo.distanceText : '—'}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Distance</div>
            </div>
            <div className="text-center">
              <i className="bi bi-clock-fill text-success mb-1 d-block"></i>
              <div className="fw-bold small">{routeInfo ? routeInfo.durationText : '—'}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Est. Time</div>
            </div>
            <div className="text-center">
              <i className="bi bi-cash-coin text-success mb-1 d-block"></i>
              <div className="fw-bold small">Cash</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Payment</div>
            </div>
          </div>
        </div>

        {/* Order Button */}
        <div className="p-4 bg-white">
          <button
            className="btn w-100 rounded-pill py-3 fw-bold fs-5 text-white"
            onClick={handleOrderSafar}
            disabled={loading || !isOrderButtonReady}
            style={{ backgroundColor: '#80CCA5', opacity: (loading || !isOrderButtonReady) ? 0.6 : 1 }}
          >
            {loading ? 'Requesting...' : 'Order Safar'}
          </button>
        </div>

      </div>
    </MapPlaceholder>
  );
};
