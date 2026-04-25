import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import PassengerManagement from './PassengerManagement';
import CaptainManagement from './CaptainManagement';
import ActiveRides from './ActiveRides';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/passengers" element={<PassengerManagement />} />
        <Route path="/captains" element={<CaptainManagement />} />
        <Route path="/rides" element={<ActiveRides />} />
      </Routes>
    </Router>
  );
}

export default App;
