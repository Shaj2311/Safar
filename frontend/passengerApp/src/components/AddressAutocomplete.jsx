import React, { useState, useEffect } from 'react';

export const AddressAutocomplete = ({ placeholder, onSelectAddress, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || '');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (value.length > 2 && value !== defaultValue) {
        try {
          // Free Nominatim API - No API Key Required!
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=pk`);
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Geocoding error: ", error);
        }
      } else {
        setSuggestions([]);
      }
    }, 500); // Wait 500ms before calling API to prevent spam

    return () => clearTimeout(delayDebounceFn);
  }, [value, defaultValue]);

  const handleSelect = (place) => {
    setValue(place.display_name);
    setSuggestions([]);
    onSelectAddress({ 
      lat: parseFloat(place.lat), 
      lng: parseFloat(place.lon), 
      address: place.display_name 
    });
  };

  return (
    <div className="position-relative w-100 mb-3 text-start">
      <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2">
        <i className={placeholder.includes('Pickup') ? "bi bi-circle-fill text-success small me-2" : "bi bi-square-fill text-danger small me-2"}></i>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="form-control border-0 bg-transparent shadow-none p-0 fw-bold"
          style={{ color: '#333333' }}
        />
      </div>
      
      {suggestions.length > 0 && (
        <ul className="list-group position-absolute w-100 shadow" style={{ top: '100%', zIndex: 2000, marginTop: '5px', maxHeight: '250px', overflowY: 'auto' }}>
          {suggestions.map((place) => (
            <li 
              key={place.place_id} 
              className="list-group-item list-group-item-action py-3" 
              onClick={() => handleSelect(place)} 
              style={{ cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <div className="d-flex align-items-start">
                <i className="bi bi-geo-alt me-2 text-muted mt-1"></i>
                <span style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}>{place.display_name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
