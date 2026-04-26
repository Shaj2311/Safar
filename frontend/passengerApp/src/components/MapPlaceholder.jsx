import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

const buildPoint = (point) => {
  if (!point) {
    return null;
  }

  const lat = Number(point.lat);
  const lng = Number(point.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(pointB.lat - pointA.lat);
  const deltaLng = toRadians(pointB.lng - pointA.lng);
  const latA = toRadians(pointA.lat);
  const latB = toRadians(pointB.lat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
    + Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getNearestReferenceDistanceKm = (point, pickupPoint, dropoffPoint) => {
  const referencePoints = [pickupPoint, dropoffPoint].filter(Boolean);
  if (!point || referencePoints.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(...referencePoints.map((referencePoint) => getDistanceKm(point, referencePoint)));
};

const resolveDriverPointAxis = (driverPoint, pickupPoint, dropoffPoint) => {
  if (!driverPoint) {
    return null;
  }

  const swappedPoint = buildPoint({ lat: driverPoint.lng, lng: driverPoint.lat });
  if (!swappedPoint) {
    return driverPoint;
  }

  const hasTripReferences = Boolean(pickupPoint || dropoffPoint);
  if (hasTripReferences) {
    const normalDistance = getNearestReferenceDistanceKm(driverPoint, pickupPoint, dropoffPoint);
    const swappedDistance = getNearestReferenceDistanceKm(swappedPoint, pickupPoint, dropoffPoint);

    if (swappedDistance + 1 < normalDistance) {
      return swappedPoint;
    }

    return driverPoint;
  }

  return driverPoint;
};

export const MapPlaceholder = ({ children, onMenuClick, pickup, dropoff, onRouteCalculated, onRouteEtaCalculated, driverLocation, liveRouteMode }) => {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_CENTER);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  const pickupPoint = useMemo(() => buildPoint(pickup), [pickup]);
  const dropoffPoint = useMemo(() => buildPoint(dropoff), [dropoff]);
  const liveDriverPoint = useMemo(() => buildPoint(driverLocation), [driverLocation]);
  const resolvedDriverPoint = useMemo(
    () => resolveDriverPointAxis(liveDriverPoint, pickupPoint, dropoffPoint),
    [liveDriverPoint, pickupPoint, dropoffPoint]
  );

  const shouldTrackPickup = liveRouteMode === 'to_pickup';
  const shouldTrackDropoff = liveRouteMode === 'to_dropoff';

  const routeOrigin = useMemo(
    () => (resolvedDriverPoint && (shouldTrackPickup || shouldTrackDropoff) ? resolvedDriverPoint : pickupPoint),
    [resolvedDriverPoint, pickupPoint, shouldTrackPickup, shouldTrackDropoff]
  );

  const routeDestination = useMemo(() => {
    if (resolvedDriverPoint && shouldTrackPickup) {
      return pickupPoint;
    }

    if (resolvedDriverPoint && shouldTrackDropoff) {
      return dropoffPoint;
    }

    return dropoffPoint;
  }, [resolvedDriverPoint, shouldTrackPickup, shouldTrackDropoff, pickupPoint, dropoffPoint]);

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
    }
  }, []);

  // Route draw karo: standard pickup->dropoff ya live driver tracking route
  useEffect(() => {
    if (!routeOrigin || !routeDestination || !window.google) {
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: routeOrigin.lat, lng: routeOrigin.lng },
        destination: { lat: routeDestination.lat, lng: routeDestination.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);

          const routeLeg = result.routes?.[0]?.legs?.[0] || null;
          if (onRouteEtaCalculated && routeLeg?.duration?.text) {
            onRouteEtaCalculated(routeLeg.duration.text);
          }

          // Fare calculate karo: distance (meters) / 1000 = km, then * 100
          if (onRouteCalculated && !resolvedDriverPoint) {
            const distanceMeters = result.routes[0].legs[0].distance.value;
            const distanceKm = distanceMeters / 1000;
            const fare = Math.ceil(distanceKm * 100);
            onRouteCalculated(fare);
          }

          // Map ko route ke ird gird fit karo
          if (mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend({ lat: routeOrigin.lat, lng: routeOrigin.lng });
            bounds.extend({ lat: routeDestination.lat, lng: routeDestination.lng });
            mapRef.current.fitBounds(bounds, { top: 80, bottom: 300, left: 40, right: 40 });
          }
        } else {
          console.error('Directions failed:', status);
          setDirections(null);
        }
      }
    );
  }, [routeOrigin, routeDestination, onRouteCalculated, onRouteEtaCalculated, resolvedDriverPoint, liveRouteMode]);

  // Jab sirf pickup select hova ho toh map us pe center karo
  useEffect(() => {
    if (mapRef.current && pickupPoint && !dropoffPoint && !resolvedDriverPoint) {
      mapRef.current.panTo({ lat: pickupPoint.lat, lng: pickupPoint.lng });
      mapRef.current.setZoom(15);
    }
  }, [pickupPoint, dropoffPoint, resolvedDriverPoint]);

  const center = routeOrigin && routeDestination
    ? {
      lat: (routeOrigin.lat + routeDestination.lat) / 2,
      lng: (routeOrigin.lng + routeDestination.lng) / 2,
    }
    : resolvedDriverPoint
      ? { lat: resolvedDriverPoint.lat, lng: resolvedDriverPoint.lng }
      : pickupPoint
        ? { lat: pickupPoint.lat, lng: pickupPoint.lng }
        : currentLocation || DEFAULT_CENTER;

  const directionsToRender = routeOrigin && routeDestination ? directions : null;

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
          {currentLocation && !pickupPoint && !resolvedDriverPoint && (
            <Marker position={currentLocation} />
          )}

          {/* Pickup marker */}
          {pickupPoint && (
            <Marker
              position={{ lat: pickupPoint.lat, lng: pickupPoint.lng }}
              icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
            />
          )}

          {/* Dropoff marker */}
          {dropoffPoint && (
            <Marker
              position={{ lat: dropoffPoint.lat, lng: dropoffPoint.lng }}
              icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
            />
          )}

          {/* Live driver marker */}
          {resolvedDriverPoint && (
            <Marker
              position={{ lat: resolvedDriverPoint.lat, lng: resolvedDriverPoint.lng }}
              icon={{ url: 'https://maps.google.com/mapfiles/kml/shapes/cabs.png' }}
            />
          )}

          {/* Route line */}
          {directionsToRender && (
            <DirectionsRenderer
              directions={directionsToRender}
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
