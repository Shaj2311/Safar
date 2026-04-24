import React, { useState } from 'react';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { VehicleSelection } from './components/VehicleSelection';
import { Searching } from './components/Searching';
import { DriverArrived } from './components/DriverArrived';
import { TripCompleted } from './components/TripCompleted';
import { Rating } from './components/Rating';
import { Sidebar } from './components/Sidebar';
import { History } from './components/History';
import { Settings } from './components/Settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRideId, setCurrentRideId] = useState(null);
  
  // Lifted state for mapping and routing
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login setCurrentScreen={setCurrentScreen} />;
      case 'home':
        return <Home setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} pickup={pickup} setPickup={setPickup} dropoff={dropoff} setDropoff={setDropoff} />;
      case 'vehicle-selection':
        return <VehicleSelection setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} setCurrentRideId={setCurrentRideId} pickup={pickup} dropoff={dropoff} />;
      case 'searching':
        return <Searching setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} currentRideId={currentRideId} />;
      case 'driver-arrived':
        return <DriverArrived setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} currentRideId={currentRideId} />;
      case 'trip-completed':
        return <TripCompleted setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} currentRideId={currentRideId} />;
      case 'rating':
        return <Rating setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} currentRideId={currentRideId} />;
      case 'history':
        return <History setCurrentScreen={setCurrentScreen} />;
      case 'settings':
        return <Settings setCurrentScreen={setCurrentScreen} />;
      default:
        return <Login setCurrentScreen={setCurrentScreen} />;
    }
  };

  return (
    <div className="mobile-container">
      <div className="status-bar">
        <span>9:41</span>
        <span>
          <i className="bi bi-wifi me-2"></i>
          <i className="bi bi-battery-full"></i>
        </span>
      </div>
      
      {renderScreen()}

      {isSidebarOpen && (
        <Sidebar onClose={() => setIsSidebarOpen(false)} setCurrentScreen={setCurrentScreen} />
      )}
    </div>
  );
}

export default App;
