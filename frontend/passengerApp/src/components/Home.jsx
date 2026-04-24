import React from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { AddressAutocomplete } from './AddressAutocomplete';

export const Home = ({ setCurrentScreen, onMenuClick, pickup, setPickup, dropoff, setDropoff }) => {
  
  const handleConfirm = () => {
    if (pickup && dropoff) {
      setCurrentScreen('vehicle-selection');
    } else {
      alert('Please select both a pickup and dropoff location!');
    }
  };

  return (
    <MapPlaceholder onMenuClick={onMenuClick} pickup={pickup} dropoff={dropoff}>
      <div className="overlay-drawer text-center pt-4 pb-4 px-3 bg-white" style={{ borderTopLeftRadius: '25px', borderTopRightRadius: '25px', boxShadow: '0 -5px 15px rgba(0,0,0,0.1)' }}>
        
        <AddressAutocomplete 
          placeholder="Pickup Location" 
          defaultValue={pickup ? pickup.address : ''} 
          onSelectAddress={(data) => setPickup(data)} 
        />
        
        <AddressAutocomplete 
          placeholder="Where to?" 
          defaultValue={dropoff ? dropoff.address : ''} 
          onSelectAddress={(data) => setDropoff(data)} 
        />
        
        <button 
          className="btn btn-safar-primary w-100 rounded-pill py-3 mt-3 shadow-sm fs-5 fw-bold"
          onClick={handleConfirm}
          disabled={!pickup || !dropoff}
          style={{ opacity: (!pickup || !dropoff) ? 0.5 : 1 }}
        >
          Confirm Locations
        </button>
      </div>
    </MapPlaceholder>
  );
};
