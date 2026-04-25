import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import PassengerManagement from './PassengerManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/passengers" element={<PassengerManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
