import React, { useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
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

const LIBRARIES = ['places', 'geometry'];

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [currentScreen, setCurrentScreen] = useState('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRideId, setCurrentRideId] = useState(null);

  // Lifted state for mapping and routing
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);

  if (!isLoaded) {
    return (
      <div className="mobile-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status"></div>
          <p className="text-muted">Loading Safar...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login setCurrentScreen={setCurrentScreen} />;
      case 'home':
        return <Home setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} pickup={pickup} setPickup={setPickup} dropoff={dropoff} setDropoff={setDropoff} />;
      case 'vehicle-selection':
        return <VehicleSelection setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} setCurrentRideId={setCurrentRideId} pickup={pickup} dropoff={dropoff} />;
      case 'searching':
        return <Searching setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} currentRideId={currentRideId} setCurrentRideId={setCurrentRideId} />;
      case 'driver-arrived':
        return <DriverArrived setCurrentScreen={setCurrentScreen} onMenuClick={() => setIsSidebarOpen(true)} currentRideId={currentRideId} pickup={pickup} dropoff={dropoff} />;
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
      {renderScreen()}

      {isSidebarOpen && (
        <Sidebar onClose={() => setIsSidebarOpen(false)} setCurrentScreen={setCurrentScreen} />
      )}
    </div>
  );
}

export default App;
