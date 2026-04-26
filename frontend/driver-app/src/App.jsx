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
import CallPassenger from './pages/CallPassenger';
import TripHistory from './pages/TripHistory';

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
        <Route path="/call" element={<CallPassenger />} />
        <Route path="/trip-history" element={<TripHistory />} />
      </Routes>
    </Router>
  );
}

export default App;