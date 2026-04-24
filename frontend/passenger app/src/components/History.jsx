import React from 'react';

export const History = ({ setCurrentScreen }) => {
  const mockTrips = [
    { id: 1, date: 'Oct 24, 2023', price: 'Rs. 450', destination: 'Badshahi Mosque' },
    { id: 2, date: 'Oct 22, 2023', price: 'Rs. 300', destination: 'Packages Mall' },
    { id: 3, date: 'Oct 20, 2023', price: 'Rs. 800', destination: 'Lahore Airport' },
  ];

  return (
    <div className="w-100 h-100 d-flex flex-column bg-light" style={{ zIndex: 5 }}>
      <div className="p-4 bg-white shadow-sm d-flex align-items-center mb-3">
        <button 
          className="btn btn-outline-secondary rounded-circle d-flex justify-content-center align-items-center me-3" 
          style={{ width: '40px', height: '40px' }}
          onClick={() => setCurrentScreen('home')}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h4 className="mb-0 fw-bold">Trip History</h4>
      </div>

      <div className="flex-grow-1 overflow-auto px-3 pb-4">
        <div className="list-group">
          {mockTrips.map(trip => (
            <div key={trip.id} className="list-group-item list-group-item-action border-0 mb-3 rounded-4 shadow-sm p-4">
              <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                <h5 className="mb-0 fw-bold text-dark">{trip.destination}</h5>
                <span className="fw-bold text-success fs-5">{trip.price}</span>
              </div>
              <small className="text-muted">{trip.date}</small>
            </div>
          ))}
        </div>
        
        <button 
          className="btn btn-safar-primary w-100 rounded-pill mt-4"
          onClick={() => setCurrentScreen('home')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
