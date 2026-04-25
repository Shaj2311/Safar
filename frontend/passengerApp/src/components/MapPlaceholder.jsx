import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

// Default: Lahore center
const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 };

const MAP_OPTIONS = {
  disableDefaultUI: true,       // Hide all default Google controls
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export const MapPlaceholder = ({ children, onMenuClick, pickup, dropoff, onRouteCalculated }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // User ki current location detect karo
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCurrentLocation(DEFAULT_CENTER)
      );
    } else {
      setCurrentLocation(DEFAULT_CENTER);
    }
  }, []);

  // Dono locations select hone ke baad directions fetch karo
  useEffect(() => {
    if (!pickup || !dropoff || !window.google) {
      setDirections(null);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: dropoff.lat, lng: dropoff.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);

          // Fare calculate karo: distance (meters) / 1000 = km, then * 100
          if (onRouteCalculated) {
            const distanceMeters = result.routes[0].legs[0].distance.value;
            const distanceKm = distanceMeters / 1000;
            const fare = Math.ceil(distanceKm * 100);
            onRouteCalculated(fare);
          }

          // Map ko route ke ird gird fit karo
          if (mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend({ lat: pickup.lat, lng: pickup.lng });
            bounds.extend({ lat: dropoff.lat, lng: dropoff.lng });
            mapRef.current.fitBounds(bounds, { top: 80, bottom: 300, left: 40, right: 40 });
          }
        } else {
          console.error('Directions failed:', status);
          setDirections(null);
        }
      }
    );
  }, [pickup, dropoff, onRouteCalculated]);

  // Jab sirf pickup select hova ho toh map us pe center karo
  useEffect(() => {
    if (mapRef.current && pickup && !dropoff) {
      mapRef.current.panTo({ lat: pickup.lat, lng: pickup.lng });
      mapRef.current.setZoom(15);
    }
  }, [pickup, dropoff]);

  const center = pickup
    ? { lat: pickup.lat, lng: pickup.lng }
    : currentLocation || DEFAULT_CENTER;

  return (
    <div className="map-placeholder w-100 h-100 d-flex flex-column position-relative">
      {/* Hamburger Menu — sabse upar, map ke upar */}
      <div
        onClick={onMenuClick}
        style={{ cursor: 'pointer', zIndex: 9999, position: 'absolute', top: '20px', left: '20px' }}
      >
        <div
          className="bg-white rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ width: '45px', height: '45px' }}
        >
          <i className="bi bi-list fs-3 text-dark"></i>
        </div>
      </div>

      {/* Google Map full screen */}
      <div className="position-absolute w-100 h-100 top-0 start-0" style={{ zIndex: 1 }}>
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={14}
          options={MAP_OPTIONS}
          onLoad={onMapLoad}
        >
          {/* Current location marker (jab koi selection nahi) */}
          {currentLocation && !pickup && (
            <Marker position={currentLocation} />
          )}

          {/* Pickup marker */}
          {pickup && (
            <Marker
              position={{ lat: pickup.lat, lng: pickup.lng }}
              icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
            />
          )}

          {/* Dropoff marker */}
          {dropoff && (
            <Marker
              position={{ lat: dropoff.lat, lng: dropoff.lng }}
              icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
            />
          )}

          {/* Route line */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true, // Humhare custom markers use karo
                polylineOptions: {
                  strokeColor: '#2B3445',
                  strokeWeight: 5,
                  strokeOpacity: 0.85,
                },
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Bottom UI children (drawers, buttons) */}
      <div
        className="position-relative w-100 h-100 d-flex flex-column justify-content-end"
        style={{ zIndex: 1000, pointerEvents: 'none' }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
