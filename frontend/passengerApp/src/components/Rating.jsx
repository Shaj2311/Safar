import React, { useState } from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { submitRideRating } from '../services/api';

export const Rating = ({ setCurrentScreen, onMenuClick, currentRideId }) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    // Agar local UI testing chal rahi hai aur currentRideId nahi hai toh directly home pe bhejo
    if (!currentRideId) {
      setCurrentScreen('home');
      return;
    }

    setLoading(true);
    try {
      await submitRideRating(currentRideId, rating);
      setLoading(false);
      setCurrentScreen('home');
    } catch (error) {
      console.error("Failed to submit rating:", error);
      alert("Failed to submit rating. Please try again.");
      setLoading(false);
    }
  };

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
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          style={{ opacity: rating === 0 || loading ? 0.5 : 1 }}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </MapPlaceholder>
  );
};
