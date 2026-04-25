import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Login from './Login';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import PassengerManagement from './PassengerManagement';
import CaptainManagement from './CaptainManagement';
import ActiveRides from './ActiveRides';
import SupportTickets from './SupportTickets';

const pageTitles = {
  '/': 'Overview Dashboard',
  '/rides': 'Live & Recent Rides',
  '/captains': 'Captain Management',
  '/passengers': 'Passenger Management',
  '/tickets': 'Complaints & Tickets',
};

const Header = ({ onLogout }) => {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'Admin Panel';
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const username = localStorage.getItem('safar_admin_name') || 'Admin User';
  const role = localStorage.getItem('safar_admin_role') || 'staff';

  return (
    <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom">
      <h5 className="m-0 fw-semibold text-dark">{title}</h5>
      <div className="d-flex align-items-center gap-3">
        
        {/* Profile Dropdown */}
        <div className="dropdown position-relative">
          <button 
            className="btn btn-light rounded-pill px-3 py-2 d-flex align-items-center gap-2 border"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <i className="bi bi-person-circle fs-5 text-primary"></i>
            <div className="text-start d-none d-sm-block" style={{ lineHeight: '1.2' }}>
              <div className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>{username}</div>
              <div className="text-muted small text-capitalize" style={{ fontSize: '0.75rem' }}>{role}</div>
            </div>
            <i className="bi bi-chevron-down ms-1 text-muted" style={{ fontSize: '0.75rem' }}></i>
          </button>
          
          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="position-fixed top-0 start-0 w-100 h-100" 
                style={{ zIndex: 1040 }} 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              
              <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-sm border-0 rounded-3" style={{ minWidth: '220px', zIndex: 1050 }}>
                <div className="px-4 py-3 border-bottom bg-light rounded-top">
                  <p className="mb-0 fw-bold text-dark fs-6">{username}</p>
                  <small className="text-muted text-capitalize">{role} Account</small>
                </div>
                <div className="p-2">
                  <button
                    className="dropdown-item text-danger d-flex align-items-center gap-2 py-2 rounded-2"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <i className="bi bi-box-arrow-right fs-5"></i> <span className="fw-medium">Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('safar_admin_token') !== null;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    localStorage.removeItem('safar_admin_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="d-flex" style={{ height: '100vh' }}>
        <Sidebar />

        <div className="d-flex flex-column flex-grow-1 overflow-hidden">
          <Header onLogout={handleLogout} />

          <main className="flex-grow-1 overflow-auto p-4 bg-light">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/passengers" element={<PassengerManagement />} />
              <Route path="/captains" element={<CaptainManagement />} />
              <Route path="/rides" element={<ActiveRides />} />
              <Route path="/tickets" element={<SupportTickets />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
