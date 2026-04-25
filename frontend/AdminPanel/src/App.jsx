import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import PassengerManagement from './PassengerManagement';
import CaptainManagement from './CaptainManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/passengers" element={<PassengerManagement />} />
        <Route path="/captains" element={<CaptainManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
