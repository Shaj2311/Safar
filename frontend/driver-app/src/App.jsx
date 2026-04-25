import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/Login';
import Home from './pages/Home';
import AcceptRequest from './pages/AcceptRequest';
import TripDashboard from './pages/TripDashboard';
import TripSummary from './pages/TripSummary';
import PaymentScreen from './pages/PaymentScreen';
import DriverProfile from './pages/DriverProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/accept-request" element={<AcceptRequest />} />
        <Route path="/trip-dashboard" element={<TripDashboard />} />
        <Route path="/trip-summary" element={<TripSummary />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/profile" element={<DriverProfile />} />
      </Routes>
    </Router>
  );
}

export default App;