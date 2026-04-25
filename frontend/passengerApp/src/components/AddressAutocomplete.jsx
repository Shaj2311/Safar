import React, { useState, useEffect } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

export const AddressAutocomplete = ({ placeholder, onSelectAddress, defaultValue }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Pakistan ke locations ko prefer karo
      componentRestrictions: { country: 'pk' },
    },
    debounce: 400,
  });

  // Default value set karo agar already koi location select hai
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue, false);
    }
  }, [defaultValue, setValue]);

  const handleSelect = async (description) => {
    setValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onSelectAddress({ lat, lng, address: description });
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const isPickup = placeholder.toLowerCase().includes('pickup');

  return (
    <div className="position-relative w-100 mb-3 text-start">
      <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2">
        <i className={`${isPickup ? 'bi-circle-fill text-success' : 'bi-square-fill text-danger'} bi small me-2`}></i>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder={placeholder}
          className="form-control border-0 bg-transparent shadow-none p-0 fw-bold"
          style={{ color: '#333333' }}
        />
      </div>

      {status === 'OK' && (
        <ul
          className="list-group position-absolute w-100 shadow"
          style={{ top: '100%', zIndex: 9999, marginTop: '5px', maxHeight: '250px', overflowY: 'auto' }}
        >
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              className="list-group-item list-group-item-action py-3"
              onClick={() => handleSelect(description)}
              style={{ cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <div className="d-flex align-items-start">
                <i className="bi bi-geo-alt me-2 text-muted mt-1"></i>
                <span style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}>{description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
