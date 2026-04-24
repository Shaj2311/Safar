import React, { useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';

export const Rating = ({ setCurrentScreen, onMenuClick }) => {
  const [rating, setRating] = useState(0);

  return (
    <MapPlaceholder onMenuClick={onMenuClick}>
      <div className="overlay-drawer text-center p-4">
        <h5 className="mb-4 mt-2">Rate your driver</h5>
        
        <div className="d-flex justify-content-center mb-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <i 
              key={star}
              className={`bi ${star <= rating ? 'bi-star-fill text-warning' : 'bi-star text-warning'} fs-1 mx-2`}
              style={{ cursor: 'pointer' }}
              onClick={() => setRating(star)}
            ></i>
          ))}
        </div>
        
        <button 
          className="btn btn-safar-primary w-100 rounded-pill py-3"
          onClick={() => setCurrentScreen('home')}
          disabled={rating === 0}
          style={{ opacity: rating === 0 ? 0.5 : 1 }}
        >
          Submit
        </button>
      </div>
    </MapPlaceholder>
  );
};
