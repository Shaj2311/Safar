import React from 'react';

export const MapPlaceholder = ({ children, onMenuClick }) => {
  return (
    <div className="map-placeholder w-100 h-100 d-flex flex-column relative">
      <div className="hamburger-menu" onClick={onMenuClick} style={{ cursor: 'pointer' }}>
        <i className="bi bi-list"></i>
      </div>
      
      {/* We can use an actual image or just leave the styled placeholder */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center flex-column" style={{ opacity: 0.7 }}>
        <h2 className="text-dark bg-white p-2 rounded shadow-sm opacity-75">Map Interface</h2>
        <div className="mt-2 bg-white rounded-circle p-2 shadow">
            <i className="bi bi-geo-alt-fill text-danger fs-3"></i>
        </div>
      </div>

      {children}
    </div>
  );
};
