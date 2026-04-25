import React, { useState, useEffect } from 'react';
import api from './services/api';

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    totalRides: 0,
    activeCaptains: 0,
    totalPassengers: 0,
    todaysRevenue: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keeping dummy data for the second endpoint (Recent Rides) for now
  const [recentRides] = useState([
    { id: '#TRP-001', passenger: 'Ali Khan', captain: 'Ahmed Driver', status: 'Ongoing', fare: 450 },
    { id: '#TRP-002', passenger: 'Sara Ahmed', captain: 'Kamran Ali', status: 'Completed', fare: 320 },
    { id: '#TRP-003', passenger: 'Usman Tariq', captain: 'Bilal Khan', status: 'Ongoing', fare: 550 },
    { id: '#TRP-004', passenger: 'Ayesha Gul', captain: 'Zain Abbas', status: 'Cancelled', fare: 0 },
    { id: '#TRP-005', passenger: 'Omer Farooq', captain: 'Saad Malik', status: 'Ongoing', fare: 410 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // api.js handles appending the base URL and safar_admin_token automatically
        const response = await api.get('/super/stats');
        
        // Mapping backend response to our UI state.
        // We fallback to 0 if certain fields (like revenue) are missing from the stats payload
        setKpis({
          totalRides: response.data.total_trips || 0,
          activeCaptains: response.data.active_drivers || 0,
          totalPassengers: response.data.total_passengers || 0, 
          todaysRevenue: response.data.todays_revenue || 0, 
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard metrics. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Ongoing': return 'bg-warning text-dark';
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="card-subtitle text-muted mb-0">Total Rides</h6>
                <span className="text-secondary fs-5">🚗</span>
              </div>
              <h3 className="card-title fw-bold mb-1">
                {loading ? '...' : kpis.totalRides.toLocaleString()}
              </h3>
              <small className="text-success fw-medium">+8% this week</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="card-subtitle text-muted mb-0">Today's Revenue</h6>
                <span className="text-secondary fs-5">💰</span>
              </div>
              <h3 className="card-title fw-bold mb-1">
                {loading ? '...' : `Rs. ${kpis.todaysRevenue.toLocaleString()}`}
              </h3>
              <small className="text-success fw-medium">+12% this week</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="card-subtitle text-muted mb-0">Active Captains</h6>
                <span className="text-secondary fs-5">👤</span>
              </div>
              <h3 className="card-title fw-bold mb-1">
                {loading ? '...' : kpis.activeCaptains}
              </h3>
              <small className="text-success fw-medium">+2% this week</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="card-subtitle text-muted mb-0">Total Passengers</h6>
                <span className="text-secondary fs-5">👤</span>
              </div>
              <h3 className="card-title fw-bold mb-1">
                {loading ? '...' : kpis.totalPassengers.toLocaleString()}
              </h3>
              <small className="text-success fw-medium">+15% this week</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4 border-0 rounded-3">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
          <h4 className="card-title mb-0 fw-semibold text-dark">Rides This Week</h4>
        </div>
        <div className="card-body p-4">
          <div
            className="w-100 rounded d-flex flex-column align-items-center justify-content-center text-muted"
            style={{ height: '300px', backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6' }}
          >
            <p className="mb-1 fw-medium fs-5">Chart Component Placeholder</p>
            <small>Bar/Line chart will be integrated here</small>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4">
          <h4 className="card-title mb-0 fw-semibold text-dark">Live / Recent Rides</h4>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-borderless align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 text-muted fw-semibold py-3 border-bottom">Ride ID</th>
                  <th className="text-muted fw-semibold py-3 border-bottom">Passenger Name</th>
                  <th className="text-muted fw-semibold py-3 border-bottom">Captain Name</th>
                  <th className="text-muted fw-semibold py-3 border-bottom">Fare</th>
                  <th className="pe-4 text-muted fw-semibold py-3 border-bottom">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map((ride, index) => (
                  <tr key={index} className="border-bottom">
                    <td className="ps-4 fw-medium text-secondary py-3">{ride.id}</td>
                    <td className="py-3 text-dark">{ride.passenger}</td>
                    <td className="py-3 text-dark">{ride.captain}</td>
                    <td className="py-3 text-dark">Rs. {ride.fare}</td>
                    <td className="pe-4 py-3">
                      <span
                        className={`badge rounded-pill ${getBadgeClass(ride.status)} px-3 py-2 fw-medium`}
                        style={{ minWidth: '90px' }}
                      >
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
