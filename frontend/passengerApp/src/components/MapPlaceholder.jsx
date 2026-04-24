import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon paths issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically adjust map view when locations change
const MapController = ({ pickup, dropoff, currentLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 15);
    } else if (currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], 14);
    }
  }, [pickup, dropoff, currentLocation, map]);
  return null;
};

export const MapPlaceholder = ({ children, onMenuClick, pickup, dropoff }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    // Get user's physical location on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }, () => {
        // Fallback to Lahore if denied
        setCurrentLocation({ lat: 31.5204, lng: 74.3587 });
      });
    } else {
        setCurrentLocation({ lat: 31.5204, lng: 74.3587 });
    }
  }, []);

  useEffect(() => {
    // Draw route using OSRM Public API
    const fetchRoute = async () => {
      if (pickup && dropoff) {
        try {
          // OSRM Public API (Requires Longitude, Latitude order!)
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            // GeoJSON returns [lng, lat], but Leaflet expects [lat, lng]
            const coords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRouteCoordinates(coords);
          }
        } catch (error) {
          console.error("Failed to fetch route", error);
        }
      } else {
        setRouteCoordinates([]);
      }
    };
    fetchRoute();
  }, [pickup, dropoff]);

  if (!currentLocation && !pickup && !dropoff) {
    return <div className="w-100 h-100 d-flex align-items-center justify-content-center text-dark bg-light">Detecting Location...</div>;
  }

  const center = pickup ? [pickup.lat, pickup.lng] : currentLocation ? [currentLocation.lat, currentLocation.lng] : [31.5204, 74.3587];

  return (
    <div className="map-placeholder w-100 h-100 d-flex flex-column position-relative">
      {/* Hamburger Menu Overlay */}
      <div 
        onClick={onMenuClick} 
        style={{ cursor: 'pointer', zIndex: 1000, position: 'absolute', top: '20px', left: '20px' }}
      >
        <div className="bg-white rounded-circle shadow d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
          <i className="bi bi-list fs-3 text-dark"></i>
        </div>
      </div>
      
      {/* Actual React-Leaflet OpenStreetMap */}
      <div className="position-absolute w-100 h-100 top-0 start-0" style={{ zIndex: 1 }}>
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController pickup={pickup} dropoff={dropoff} currentLocation={currentLocation} />
          
          {currentLocation && !pickup && !dropoff && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} />
          )}
          {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
          {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} />}
          
          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="#2B3445" weight={5} opacity={0.8} />
          )}
        </MapContainer>
      </div>

      {/* Children elements (Bottom UI Sheets) */}
      <div className="position-relative w-100 h-100 d-flex flex-column justify-content-end pointer-events-none" style={{ zIndex: 1000 }}>
        <div style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
