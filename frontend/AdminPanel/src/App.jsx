import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

const Header = () => {
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
        <button className="btn btn-outline-secondary btn-sm fw-medium">Log Out</button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="d-flex" style={{ height: '100vh' }}>
        <Sidebar />

        <div className="d-flex flex-column flex-grow-1 overflow-hidden">
          <Header />

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
