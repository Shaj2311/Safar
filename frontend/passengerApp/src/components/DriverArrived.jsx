import React, { useEffect, useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { getRideStatus, getRideDriverDetails, getRideDetailsByAnyEndpoint } from '../services/api';

const normalizeKey = (key) => String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const normalizeStatusValue = (status) => String(status || '').trim().toLowerCase().replace(/\s+/g, '_');

const isRideTerminalStatus = (status) => {
  const normalizedStatus = normalizeStatusValue(status);
  return [
    'completed',
    'complete',
    'trip_completed',
    'ended',
    'end',
    'finished',
    'payment_pending',
    'awaiting_payment',
    'paid',
  ].includes(normalizedStatus);
};

const isDriverAssignedStatus = (status) => {
  const normalizedStatus = normalizeStatusValue(status);
  return ['accepted', 'driver_assigned', 'in_progress'].includes(normalizedStatus);
};

const findFirstValueByKeys = (source, keyNames) => {
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
      const normalizedKey = normalizeKey(key);

      if (
        targetKeys.has(normalizedKey)
        && value !== null
        && value !== undefined
        && String(value).trim() !== ''
      ) {
        return value;
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return null;
};

const toEtaText = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${Math.round(value)} mins`;
  }

  const textValue = String(value).trim();
  if (!textValue) {
    return null;
  }

  if (/min|mins|minute|minutes/i.test(textValue)) {
    return textValue;
  }

  const numericValue = Number(textValue);
  if (!Number.isNaN(numericValue) && Number.isFinite(numericValue)) {
    return `${Math.round(numericValue)} mins`;
  }

  return textValue;
};

const extractEtaText = (...sources) => {
  for (const source of sources) {
    const etaValue = findFirstValueByKeys(source, [
      'eta',
      'etaText',
      'eta_text',
      'estimated_time',
      'estimatedTime',
      'arrival_time',
      'arrivalTime',
      'minutes_away',
      'minutesAway',
      'duration_text',
      'durationText',
      'remaining_time',
      'remainingTime',
    ]);

    const formattedEta = toEtaText(etaValue);
    if (formattedEta) {
      return formattedEta;
    }
  }

  return null;
};

const extractDriverDataFromSource = (source) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const driverObject =
    (source.driver && typeof source.driver === 'object' && source.driver)
    || (source.driverInfo && typeof source.driverInfo === 'object' && source.driverInfo)
    || (source.driver_info && typeof source.driver_info === 'object' && source.driver_info)
    || (source.assignedDriver && typeof source.assignedDriver === 'object' && source.assignedDriver)
    || (source.assigned_driver && typeof source.assigned_driver === 'object' && source.assigned_driver)
    || null;

  const vehicleObject =
    (source.vehicle && typeof source.vehicle === 'object' && source.vehicle)
    || (source.vehicleInfo && typeof source.vehicleInfo === 'object' && source.vehicleInfo)
    || (source.vehicle_info && typeof source.vehicle_info === 'object' && source.vehicle_info)
    || (driverObject?.vehicle && typeof driverObject.vehicle === 'object' && driverObject.vehicle)
    || (driverObject?.car && typeof driverObject.car === 'object' && driverObject.car)
    || null;

  const rawDriverValue = source.driver && typeof source.driver !== 'object' ? source.driver : null;
  const rawVehicleValue = source.vehicle && typeof source.vehicle !== 'object' ? source.vehicle : null;

  const name = driverObject
    ? findFirstValueByKeys(driverObject, ['name', 'full_name', 'fullName', 'driver_name', 'driverName'])
    : findFirstValueByKeys(source, ['driver_name', 'driverName', 'driver_full_name', 'driverFullName', 'name', 'full_name', 'fullName']);

  const phone = driverObject
    ? findFirstValueByKeys(driverObject, [
      'phone',
      'phone_number',
      'phoneNumber',
      'phone_no',
      'phoneNo',
      'mobile',
      'mobile_number',
      'mobileNumber',
      'mobile_no',
      'mobileNo',
      'contact',
      'contact_number',
      'contactNumber',
      'contact_no',
      'contactNo',
      'driver_phone',
      'driverPhone',
      'driver_phone_no',
      'driverPhoneNo',
    ])
    : findFirstValueByKeys(source, [
      'driver_phone',
      'driverPhone',
      'driver_phone_no',
      'driverPhoneNo',
      'driver_mobile',
      'driverMobile',
      'phone',
      'phone_number',
      'phoneNumber',
      'phone_no',
      'phoneNo',
      'contact',
      'contact_no',
      'contactNo',
      'contact_number',
      'contactNumber',
    ]);

  const vehicleMake = vehicleObject
    ? findFirstValueByKeys(vehicleObject, [
      'make',
      'vehicle_make',
      'vehicleMake',
      'car_make',
      'carMake',
      'vehicle_type',
      'vehicleType',
      'car_type',
      'carType',
    ])
    : findFirstValueByKeys(source, [
      'vehicle_make',
      'vehicleMake',
      'car_make',
      'carMake',
      'vehicle_type',
      'vehicleType',
      'car_type',
      'carType',
    ]);

  const vehicleModel = vehicleObject
    ? findFirstValueByKeys(vehicleObject, [
      'model',
      'vehicle_model',
      'vehicleModel',
      'car_model',
      'carModel',
      'vehicle_name',
      'vehicleName',
      'car_name',
      'carName',
    ])
    : findFirstValueByKeys(source, [
      'vehicle_model',
      'vehicleModel',
      'car_model',
      'carModel',
      'vehicle_name',
      'vehicleName',
      'car_name',
      'carName',
    ]);

  const plateNo = vehicleObject
    ? findFirstValueByKeys(vehicleObject, [
      'plate_no',
      'plateNo',
      'vehicle_no',
      'vehicleNo',
      'car_no',
      'carNo',
      'number_plate',
      'numberPlate',
      'vehicle_plate',
      'vehiclePlate',
      'license_plate',
      'licensePlate',
      'registration_no',
      'registrationNo',
      'reg_no',
      'regNo',
      'registration',
      'plate',
    ])
    : findFirstValueByKeys(source, [
      'plate_no',
      'plateNo',
      'vehicle_no',
      'vehicleNo',
      'car_no',
      'carNo',
      'number_plate',
      'numberPlate',
      'vehicle_plate',
      'vehiclePlate',
      'license_plate',
      'licensePlate',
      'registration_no',
      'registrationNo',
      'reg_no',
      'regNo',
      'registration',
      'plate',
    ]);

  const vehicleText = vehicleObject
    ? findFirstValueByKeys(vehicleObject, ['vehicle', 'car', 'vehicle_name', 'vehicleName', 'car_name', 'carName'])
    : findFirstValueByKeys(source, ['vehicle', 'car', 'vehicle_name', 'vehicleName', 'car_name', 'carName']);

  const resolvedName = name || (rawDriverValue ? String(rawDriverValue).trim() : null);
  const resolvedVehicleText = vehicleText || (rawVehicleValue ? String(rawVehicleValue).trim() : null);

  if (!resolvedName && !phone && !vehicleMake && !vehicleModel && !plateNo && !resolvedVehicleText) {
    return null;
  }

  return {
    name: resolvedName || null,
    phone: phone || null,
    vehicleMake: vehicleMake || null,
    vehicleModel: vehicleModel || null,
    plateNo: plateNo || null,
    vehicleText: resolvedVehicleText || null,
  };
};

const mergeDriverData = (...sources) => {
  const merged = sources.reduce(
    (accumulator, current) => {
      if (!current) {
        return accumulator;
      }

      return {
        name: accumulator.name || current.name || null,
        phone: accumulator.phone || current.phone || null,
        vehicleMake: accumulator.vehicleMake || current.vehicleMake || null,
        vehicleModel: accumulator.vehicleModel || current.vehicleModel || null,
        plateNo: accumulator.plateNo || current.plateNo || null,
        vehicleText: accumulator.vehicleText || current.vehicleText || null,
      };
    },
    { name: null, phone: null, vehicleMake: null, vehicleModel: null, plateNo: null, vehicleText: null }
  );

  if (!merged.name && !merged.phone && !merged.vehicleMake && !merged.vehicleModel && !merged.plateNo && !merged.vehicleText) {
    return null;
  }

  return merged;
};

export const DriverArrived = ({ setCurrentScreen, onMenuClick, currentRideId }) => {
  const [driver, setDriver] = useState(null);
  const [etaText, setEtaText] = useState(null);
  const [rideStatusText, setRideStatusText] = useState('');

  useEffect(() => {
    let pollingInterval;
    let isMounted = true;

    const pollRideStatusAndDriver = async () => {
      if (!currentRideId) {
        return;
      }

      try {
        const statusPayload = await getRideStatus(currentRideId);
        if (!isMounted) {
          return;
        }

        const statusValue =
          statusPayload?.Status
          || statusPayload?.status
          || statusPayload?.rideStatus
          || statusPayload?.ride_status
          || '';

        const normalizedStatus = normalizeStatusValue(statusValue);
        setRideStatusText(normalizedStatus);

        if (isRideTerminalStatus(statusValue)) {
          clearInterval(pollingInterval);
          setCurrentScreen('trip-completed');
          return;
        }

        let driverPayload = null;
        if (isDriverAssignedStatus(normalizedStatus)) {
          try {
            driverPayload = await getRideDriverDetails(currentRideId);
          } catch (driverError) {
            console.warn('Dedicated driver details endpoint failed:', driverError);
          }
        }

        let fallbackRidePayload = null;
        const primaryDriverData = mergeDriverData(
          extractDriverDataFromSource(driverPayload),
          extractDriverDataFromSource(statusPayload)
        );
        const hasPhone = Boolean(primaryDriverData?.phone);
        const hasVehicleInfo = Boolean(
          primaryDriverData?.vehicleMake
          || primaryDriverData?.vehicleModel
          || primaryDriverData?.plateNo
          || primaryDriverData?.vehicleText
        );

        if (isDriverAssignedStatus(normalizedStatus) && (!hasPhone || !hasVehicleInfo)) {
          try {
            fallbackRidePayload = await getRideDetailsByAnyEndpoint(currentRideId);
          } catch (fallbackError) {
            console.warn('Ride details fallback failed:', fallbackError);
          }
        }

        if (!isMounted) {
          return;
        }

        setDriver((previousDriver) => mergeDriverData(
          extractDriverDataFromSource(driverPayload),
          extractDriverDataFromSource(statusPayload),
          extractDriverDataFromSource(fallbackRidePayload),
          previousDriver
        ));

        setEtaText((previousEtaText) => {
          const extractedEtaText = extractEtaText(driverPayload, statusPayload, fallbackRidePayload);
          return extractedEtaText || previousEtaText || null;
        });
      } catch (error) {
        console.error('Error polling ride status and driver details:', error);
      }
    };

    if (currentRideId) {
      pollRideStatusAndDriver();
      pollingInterval = setInterval(pollRideStatusAndDriver, 3000);
    }

    return () => {
      isMounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [currentRideId, setCurrentScreen]);

  const handleCallDriver = (event) => {
    event.stopPropagation();

    const phoneNumber = String(driver?.phone || '').trim();

    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
      return;
    }

    alert('Driver phone number not available.');
  };

  const hasResolvedDriver = Boolean(driver?.name || driver?.vehicleMake || driver?.vehicleModel || driver?.plateNo || driver?.vehicleText || driver?.phone);
  const driverAssigned = isDriverAssignedStatus(rideStatusText);
  const phoneNumber = String(driver?.phone || '').trim();
  const vehicleLabel = [driver?.vehicleMake, driver?.vehicleModel].filter(Boolean).join(' ').trim() || driver?.vehicleText || null;

  return (
    <div className="w-100 h-100 d-flex flex-column">
      <MapPlaceholder onMenuClick={(event) => { event.stopPropagation(); onMenuClick && onMenuClick(event); }}>
        <div className="overlay-drawer text-center p-4" onClick={(event) => event.stopPropagation()} style={{ cursor: 'default' }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <div className="bg-light rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-person-fill text-secondary fs-2"></i>
              </div>

              <div className="text-start">
                {driver ? (
                  <>
                    <h4 className="mb-0 fw-bold">{driver.name || 'Driver assigned'}</h4>
                    <div className="text-muted small d-flex flex-column">
                      {vehicleLabel && <span>{vehicleLabel}</span>}
                      {driver.plateNo && <span className="fw-bold text-dark">{driver.plateNo}</span>}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="mb-0 fw-bold text-muted">{driverAssigned ? 'Driver assigned' : 'Finding Driver...'}</h4>
                    <small className="text-muted italic">
                      {driverAssigned ? 'Waiting for driver details from server' : 'Updating details'}
                    </small>
                  </>
                )}
              </div>
            </div>

            {(driver || driverAssigned) && (
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
              disabled={!phoneNumber || !hasResolvedDriver}
              style={{ opacity: (phoneNumber && hasResolvedDriver) ? 1 : 0.6 }}
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
