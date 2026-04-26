import React, { useEffect, useRef, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus, getDriverProfileByAnyId, getRideDetailsByAnyEndpoint } from '../services/api';

const normalizeKey = (key) => String(key).toLowerCase().replace(/[^a-z0-9]/g, '');

const normalizeStatusValue = (status) => String(status || '').trim().toLowerCase().replace(/\s+/g, '_');

const isRideTerminalStatus = (status) => {
  const normalized = normalizeStatusValue(status);
  return [
    'completed',
    'complete',
    'trip_completed',
    'ended',
    'end',
    'finished',
    'payment_pending',
    'awaiting_payment',
    'paid'
  ].includes(normalized);
};

const findFirstValueByKeyNames = (source, keyNames) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const targetKeys = new Set(keyNames.map((key) => normalizeKey(key)));
  const queue = [source];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      const normalized = normalizeKey(key);
      if (targetKeys.has(normalized) && value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return null;
};

const collectRelatedObjects = (payload, keyHint) => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const normalizedHint = normalizeKey(keyHint);
  const queue = [payload];
  const visited = new Set();
  const related = [];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (value && typeof value === 'object') {
        if (normalizeKey(key).includes(normalizedHint)) {
          related.push(value);
        }
        queue.push(value);
      }
    }
  }

  return related;
};

const extractDriverId = (ridePayload) => {
  if (!ridePayload || typeof ridePayload !== 'object') {
    return null;
  }

  const queue = [ridePayload];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      const normalizedKey = normalizeKey(key);
      const looksLikeDriverId = normalizedKey.includes('driver') && normalizedKey.includes('id');
      const looksLikeDirectDriverKey = normalizedKey === 'driver' || normalizedKey === 'driverid';
      const looksLikeAcceptedByKey = normalizedKey === 'acceptedby';

      if (looksLikeDriverId) {
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
          return numericValue;
        }
      }

      if (looksLikeDirectDriverKey || looksLikeAcceptedByKey) {
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
          return numericValue;
        }
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return null;
};

const extractCandidateDriverIds = (ridePayload) => {
  if (!ridePayload || typeof ridePayload !== 'object') {
    return [];
  }

  const ids = new Set();
  const queue = [ridePayload];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      const normalizedKey = normalizeKey(key);
      const looksLikeDriverRelatedId =
        (normalizedKey.includes('driver') && normalizedKey.includes('id')) ||
        normalizedKey === 'driver' ||
        normalizedKey === 'acceptedby';

      if (looksLikeDriverRelatedId) {
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
          ids.add(numericValue);
        }
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return Array.from(ids);
};

const pickFirstValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return null;
};

const findValueByKeyHints = (source, includeHints, excludeHints = []) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const includes = includeHints.map((hint) => normalizeKey(hint));
  const excludes = excludeHints.map((hint) => normalizeKey(hint));

  const queue = [source];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      const normalized = normalizeKey(key);
      const matchesInclude = includes.every((hint) => normalized.includes(hint));
      const matchesExclude = excludes.some((hint) => normalized.includes(hint));

      if (matchesInclude && !matchesExclude && value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return null;
};

const hasDriverSignals = (source) => {
  if (!source || typeof source !== 'object') {
    return false;
  }

  const signalHints = ['driver', 'vehicle', 'car', 'plate', 'registration', 'acceptedby'];
  const queue = [source];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      const normalized = normalizeKey(key);
      if (signalHints.some((hint) => normalized.includes(hint))) {
        return true;
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return false;
};

const toEtaText = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${Math.round(value)} mins`;
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  if (/min|mins|minute|minutes/i.test(text)) {
    return text;
  }

  const asNumber = Number(text);
  if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
    return `${Math.round(asNumber)} mins`;
  }

  return text;
};

const extractEtaText = (source) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const etaValue = findFirstValueByKeyNames(source, [
    'eta',
    'eta_text',
    'etaText',
    'estimated_time',
    'estimatedTime',
    'arrival_time',
    'arrivalTime',
    'minutes_away',
    'minutesAway',
    'duration_text',
    'durationText'
  ])
    || findValueByKeyHints(source, ['eta'])
    || findValueByKeyHints(source, ['arrival', 'time']);

  return toEtaText(etaValue);
};

const hasRideEndedSignal = (source) => {
  if (!source || typeof source !== 'object') {
    return false;
  }

  const statusFromDetails = findFirstValueByKeyNames(source, ['status', 'ride_status', 'rideStatus', 'trip_status', 'tripStatus'])
    || findValueByKeyHints(source, ['status']);

  if (isRideTerminalStatus(statusFromDetails)) {
    return true;
  }

  const endTimeValue = findFirstValueByKeyNames(source, [
    'end_time',
    'endTime',
    'completed_at',
    'completedAt',
    'trip_end_time',
    'tripEndTime',
    'dropoff_time',
    'dropoffTime'
  ]);

  return endTimeValue !== null && endTimeValue !== undefined && String(endTimeValue).trim() !== '';
};

const mapDriverFromSource = (source) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const hasSignal = hasDriverSignals(source);

  const name = findFirstValueByKeyNames(source, ['driver_name', 'driverName', 'driver_full_name', 'driverFullName'])
    || findValueByKeyHints(source, ['driver', 'name']);

  const phone = findFirstValueByKeyNames(source, ['driver_phone', 'driverPhone'])
    || findValueByKeyHints(source, ['driver', 'phone']);

  const vehicleMake = findFirstValueByKeyNames(source, ['vehicle_make', 'vehicleMake', 'car_make', 'carMake', 'make'])
    || findValueByKeyHints(source, ['vehicle', 'make'])
    || findValueByKeyHints(source, ['car', 'make']);

  const vehicleModel = findFirstValueByKeyNames(source, ['vehicle_model', 'vehicleModel', 'car_model', 'carModel', 'model'])
    || findValueByKeyHints(source, ['vehicle', 'model'])
    || findValueByKeyHints(source, ['car', 'model']);

  const plateNo = findFirstValueByKeyNames(source, ['plate_no', 'plateNo', 'number_plate', 'numberPlate', 'vehicle_plate', 'plate'])
    || findValueByKeyHints(source, ['plate'])
    || findValueByKeyHints(source, ['registration'])
    || findValueByKeyHints(source, ['regno'])
    || findValueByKeyHints(source, ['vehicleno']);

  // Reject plain passenger-like payloads that only contain generic name/phone keys.
  if (!hasSignal && !vehicleMake && !vehicleModel && !plateNo) {
    return null;
  }

  if (!name && !phone && !vehicleMake && !vehicleModel && !plateNo) {
    return null;
  }

  return { name, phone, vehicleMake, vehicleModel, plateNo };
};

const normalizeDriverData = (...sources) => {
  const mappedSources = sources
    .map((source) => mapDriverFromSource(source))
    .filter(Boolean);

  if (mappedSources.length === 0) {
    return null;
  }

  const merged = mappedSources.reduce(
    (accumulator, current) => ({
      name: accumulator.name || current.name || null,
      phone: accumulator.phone || current.phone || null,
      vehicleMake: accumulator.vehicleMake || current.vehicleMake || null,
      vehicleModel: accumulator.vehicleModel || current.vehicleModel || null,
      plateNo: accumulator.plateNo || current.plateNo || null,
    }),
    { name: null, phone: null, vehicleMake: null, vehicleModel: null, plateNo: null }
  );

  if (!merged.name && !merged.phone && !merged.vehicleMake && !merged.vehicleModel && !merged.plateNo) {
    return null;
  }

  return {
    name: merged.name || null,
    phone: merged.phone || null,
    vehicleMake: merged.vehicleMake || null,
    vehicleModel: merged.vehicleModel || null,
    plateNo: merged.plateNo || null,
  };
};

export const DriverArrived = ({ setCurrentScreen, onMenuClick, currentRideId }) => {
  const [driver, setDriver] = useState(null);
  const [etaText, setEtaText] = useState(null);
  const [rideStatusText, setRideStatusText] = useState('');
  const fetchedProfileDriverIdsRef = useRef(new Set());
  const driverRef = useRef(null);

  useEffect(() => {
    driverRef.current = driver;
  }, [driver]);

  useEffect(() => {
    let pollingInterval;
    let isMounted = true;

    const pollAndFetchDriver = async () => {
      if (!currentRideId) return;
      try {
        const data = await getRideStatus(currentRideId);
        const currentStatus = data.Status || data.status;
        const normalizedStatus = normalizeStatusValue(currentStatus);
        let nextEtaText = extractEtaText(data);

        if (isMounted) {
          setRideStatusText(normalizedStatus);
        }

        if (isMounted && isRideTerminalStatus(currentStatus)) {
          clearInterval(pollingInterval);
          setCurrentScreen('trip-completed');
          return;
        }

        const driverId = extractDriverId(data);
        const candidateDriverIds = [driverId, ...extractCandidateDriverIds(data)].filter((value, index, array) => value && array.indexOf(value) === index);

        const inlineDriver = normalizeDriverData(
          ...collectRelatedObjects(data, 'driver'),
          ...collectRelatedObjects(data, 'vehicle'),
          data.driver,
          data.driverInfo,
          data.driver_info,
          data.assignedDriver,
          data.assigned_driver
        );
        if (isMounted && inlineDriver) {
          setDriver((previousDriver) => normalizeDriverData(previousDriver, inlineDriver));
        }

        // Fallback details by ride id when status payload only has status.
        if (isMounted && !driverRef.current) {
          const fallbackRideDetails = await getRideDetailsByAnyEndpoint(currentRideId);
          if (fallbackRideDetails) {
            if (hasRideEndedSignal(fallbackRideDetails)) {
              clearInterval(pollingInterval);
              setCurrentScreen('trip-completed');
              return;
            }

            nextEtaText = nextEtaText || extractEtaText(fallbackRideDetails);
            const mappedFallbackDriver = normalizeDriverData(
              ...collectRelatedObjects(fallbackRideDetails, 'driver'),
              ...collectRelatedObjects(fallbackRideDetails, 'vehicle'),
              fallbackRideDetails.driver,
              fallbackRideDetails.driverInfo,
              fallbackRideDetails.driver_info
            );
            if (mappedFallbackDriver) {
              setDriver((previousDriver) => normalizeDriverData(previousDriver, mappedFallbackDriver));
            }

            const fallbackDriverId = extractDriverId(fallbackRideDetails);
            if (fallbackDriverId && !candidateDriverIds.includes(fallbackDriverId)) {
              candidateDriverIds.push(fallbackDriverId);
            }
          }
        }

        // Fetch profile once we can resolve a valid driver id.
        if (isMounted && candidateDriverIds.length > 0) {
          for (const candidateId of candidateDriverIds) {
            if (fetchedProfileDriverIdsRef.current.has(candidateId)) {
              continue;
            }

            fetchedProfileDriverIdsRef.current.add(candidateId);

            try {
              const profileData = await getDriverProfileByAnyId(candidateId);
              const mappedProfile = normalizeDriverData(
                ...collectRelatedObjects(profileData, 'driver'),
                ...collectRelatedObjects(profileData, 'vehicle'),
                profileData.driver,
                profileData.driverInfo,
                profileData.driver_info
              );

              nextEtaText = nextEtaText || extractEtaText(profileData);

              if (mappedProfile) {
                setDriver((previousDriver) => normalizeDriverData(previousDriver, mappedProfile));
                break;
              }
            } catch (profileError) {
              console.warn('Driver profile lookup failed for candidate id:', candidateId, profileError);
            }
          }
        }

        if (isMounted) {
          setEtaText(nextEtaText || null);
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
  }, [currentRideId, setCurrentScreen]);

  const handleCallDriver = (e) => {
    e.stopPropagation();
    if (driver && driver.phone) {
      window.location.href = `tel:${driver.phone}`;
    } else {
      alert("Driver phone number not available.");
    }
  };

  const hasResolvedDriver = Boolean(driver?.name || driver?.vehicleMake || driver?.plateNo || driver?.phone);
  const isDriverAssigned = ['accepted', 'driver_assigned', 'in_progress'].includes(rideStatusText);

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
                    <h4 className="mb-0 fw-bold">{driver.name || 'Driver assigned'}</h4>
                    <div className="text-muted small d-flex flex-column">
                      {driver.vehicleMake && (
                        <span>{driver.vehicleMake} {driver.vehicleModel || ''}</span>
                      )}
                      {driver.plateNo && (
                        <span className="fw-bold text-dark">{driver.plateNo}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="mb-0 fw-bold text-muted">{isDriverAssigned ? 'Driver assigned' : 'Finding Driver...'}</h4>
                    <small className="text-muted italic">
                      {isDriverAssigned ? 'Driver details are not available from current API response' : 'Updating details'}
                    </small>
                  </>
                )}
              </div>
            </div>

            {/* ETA from backend payloads (falls back to updating state if unavailable). */}
            {(driver || isDriverAssigned) && (
              <div className="text-success small fw-bold text-end">
                <div className="mb-0" style={{ fontSize: '0.7rem', color: '#999', fontWeight: 'normal' }}>ETA</div>
                <div>{etaText || 'Updating'}</div>
              </div>
            )}
          </div>

          <div className="d-flex flex-column gap-2">
            <button
              className="btn btn-safar-primary w-100 rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
              onClick={handleCallDriver}
              disabled={!driver?.phone || !hasResolvedDriver}
              style={{ opacity: (driver?.phone && hasResolvedDriver) ? 1 : 0.6 }}
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
