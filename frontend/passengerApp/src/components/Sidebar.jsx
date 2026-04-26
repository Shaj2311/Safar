import React from 'react';

export const Sidebar = ({ onClose, setCurrentScreen }) => {
  // Read the real name that was saved at login time
  const passengerName = localStorage.getItem('passengerName') || 'Passenger';

  const handleLogout = () => {
    localStorage.removeItem('sessionKey');
    localStorage.removeItem('passengerName');
    onClose();
    setCurrentScreen('login');
  };

  const navigateTo = (screen) => {
    onClose();
    setCurrentScreen(screen);
  };

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-content" onClick={e => e.stopPropagation()} style={{ position: 'relative', paddingTop: '70px' }}>

        {/* Close Button — top right corner */}
        <button
          onClick={onClose}
          className="btn p-0 position-absolute"
          style={{ top: '20px', right: '20px', fontSize: '1.8rem', color: '#333', lineHeight: 1 }}
          aria-label="Close menu"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Profile Section */}
        <div className="d-flex align-items-center mb-5">
          <div
            className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-white"
            style={{ width: '60px', height: '60px', flexShrink: 0, border: '2px solid #ccc' }}
          >
            <i className="bi bi-person-fill" style={{ fontSize: '2rem', color: '#888' }}></i>
          </div>
          <h4 className="mb-0 fw-bold">{passengerName}</h4>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-link" onClick={() => navigateTo('settings')} style={{ cursor: 'pointer' }}>Settings</div>
          <div className="sidebar-link mt-4" onClick={handleLogout} style={{ cursor: 'pointer' }}>Log Out</div>
        </div>
      </div>
    </div>
  );
};
