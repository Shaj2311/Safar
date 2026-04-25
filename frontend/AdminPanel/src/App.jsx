import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

  return (
    <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom">
      <h5 className="m-0 fw-semibold text-dark">{title}</h5>
      <div className="d-flex align-items-center gap-3">
        <div
          className="rounded-circle bg-secondary bg-opacity-25"
          style={{ width: '38px', height: '38px' }}
        ></div>
        <button
          className="btn btn-outline-secondary btn-sm fw-medium"
          onClick={onLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('safar_admin_token') !== null;
  });

  const handleLogin = () => {
    // Note: The actual token should be set by Login.jsx upon a successful API response.
    // We'll set a dummy token here just to test the layout flow until Login is wired up.
    if (!localStorage.getItem('safar_admin_token')) {
      localStorage.setItem('safar_admin_token', 'dummy_token_123');
    }
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
              <Route path="/" element={<Dashboard />} />
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
