import React from 'react';

export const Sidebar = ({ onClose, setCurrentScreen }) => {
  const handleLogout = () => {
    onClose();
    setCurrentScreen('login');
  };

  const navigateTo = (screen) => {
    onClose();
    setCurrentScreen(screen);
  };

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-content" onClick={e => e.stopPropagation()}>
        <div className="d-flex align-items-center mb-5 mt-4">
          <div className="bg-white rounded-circle me-3" style={{width: '60px', height: '60px'}}></div>
          <h4 className="mb-0 fw-bold">Luqman</h4>
        </div>
        
        <div className="sidebar-nav">
          <div className="sidebar-link" onClick={() => navigateTo('history')} style={{ cursor: 'pointer' }}>Trip History</div>
          <div className="sidebar-link">Payment Methods</div>
          <div className="sidebar-link" onClick={() => navigateTo('settings')} style={{ cursor: 'pointer' }}>Settings</div>
          <div className="sidebar-link mt-4" onClick={handleLogout} style={{ cursor: 'pointer' }}>Log Out</div>
        </div>
      </div>
    </div>
  );
};
