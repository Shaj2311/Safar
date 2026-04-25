import React, { useState, useEffect } from 'react';
import api from './services/api';

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    totalRides: 0,
    activeCaptains: 0,
    totalPassengers: 0,
    supportTickets: 0,
  });
  
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch stats, passengers, tickets, and rides concurrently
        const [statsRes, passengersRes, ticketsRes, ridesRes] = await Promise.all([
          api.get('/super/stats'),
          api.get('/staff/passengers'),
          api.get('/staff/tickets'),
          api.get('/staff/rides')
        ]);
        
        setKpis({
          totalRides: statsRes.data.total_trips || 0,
          activeCaptains: statsRes.data.active_drivers || 0,
          totalPassengers: passengersRes.data.length || 0, 
          supportTickets: ticketsRes.data.length || 0, 
        });

        // Map the backend rides array. We slice to 5 so it fits nicely on the dashboard.
        const ridesList = Array.isArray(ridesRes.data) ? ridesRes.data : [];
        const formattedRides = ridesList.slice(0, 5).map(ride => ({
          id: `#TRP-${ride.tripId ?? ride.id ?? '???'}`,
          // Passenger and Driver are directly returned as strings or null in this endpoint
          passenger: (typeof ride.passenger === 'string' ? ride.passenger : ride.passenger?.name) || 'Unknown',
          captain: (typeof ride.driver === 'string' ? ride.driver : ride.driver?.name) || 'Unassigned',
          status: ride.status || 'Pending',
          // Use nullish coalescing (??) instead of OR (||) so we don't accidentally override a valid 0 fare
          fare: ride.fare ?? ride.price ?? 0
        }));

        setRecentRides(formattedRides);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard metrics. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getBadgeClass = (status) => {
    const s = status.toLowerCase();
    if (s.includes('ongoing') || s.includes('active') || s.includes('progress')) return 'bg-warning text-dark';
    if (s.includes('completed') || s.includes('done')) return 'bg-success';
    if (s.includes('cancelled') || s.includes('failed')) return 'bg-danger';
    return 'bg-secondary';
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
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="card-subtitle text-muted mb-0">Support Tickets</h6>
                <span className="text-secondary fs-5">🎫</span>
              </div>
              <h3 className="card-title fw-bold mb-1">
                {loading ? '...' : kpis.supportTickets.toLocaleString()}
              </h3>
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
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="card-subtitle text-muted mb-0">Total Passengers</h6>
                <span className="text-secondary fs-5">👥</span>
              </div>
              <h3 className="card-title fw-bold mb-1">
                {loading ? '...' : kpis.totalPassengers.toLocaleString()}
              </h3>
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
                  <th className="text-muted fw-semibold py-3 border-bottom">Passenger</th>
                  <th className="text-muted fw-semibold py-3 border-bottom">Captain</th>
                  <th className="text-muted fw-semibold py-3 border-bottom">Fare</th>
                  <th className="pe-4 text-muted fw-semibold py-3 border-bottom">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Loading recent rides...
                    </td>
                  </tr>
                ) : recentRides.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No recent rides found.
                    </td>
                  </tr>
                ) : (
                  recentRides.map((ride, index) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
