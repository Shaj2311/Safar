import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const geocodeCache = new Map();

const ActiveRides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const reverseGeocode = async (lat, lng) => {
    const cacheKey = `${lat},${lng}`;
    if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey);

    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        const address = data.results[0].formatted_address;
        geocodeCache.set(cacheKey, address);
        return address;
      }
      return `${lat}, ${lng}`;
    } catch {
      return `${lat}, ${lng}`;
    }
  };

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/staff/rides');
      const rawRides = Array.isArray(response.data) ? response.data : (response.data.rides || response.data.data || []);

      const mappedRides = rawRides.map(ride => ({
        id: `#TRP-${ride.tripId ?? ride.id ?? '??'}`,
        rawId: ride.tripId ?? ride.id,
        passenger: (typeof ride.passenger === 'string' ? ride.passenger : ride.passenger?.name) || 'Unknown',
        captain: (typeof ride.driver === 'string' ? ride.driver : ride.driver?.name) || 'Unassigned',
        pickup: ride.pickup?.address || (ride.pickup ? 'Resolving location' : 'Unknown'),
        dropoff: ride.dropoff?.address || (ride.dropoff ? 'Resolving location' : 'Unknown'),
        rawPickup: ride.pickup,
        rawDropoff: ride.dropoff,
        status: String(ride.status || ride.state || 'Pending'),
        fare: ride.fare ?? ride.price ?? 0
      }));

      setRides(mappedRides);

      // Start background resolution for coordinates
      mappedRides.forEach(async (ride) => {
        if (ride.rawPickup && !ride.rawPickup.address && ride.rawPickup.x) {
          const addr = await reverseGeocode(ride.rawPickup.x, ride.rawPickup.y);
          setRides(prev => prev.map(r => r.rawId === ride.rawId ? { ...r, pickup: addr } : r));
        }
        if (ride.rawDropoff && !ride.rawDropoff.address && ride.rawDropoff.x) {
          const addr = await reverseGeocode(ride.rawDropoff.x, ride.rawDropoff.y);
          setRides(prev => prev.map(r => r.rawId === ride.rawId ? { ...r, dropoff: addr } : r));
        }
      });

    } catch (err) {
      setError(`Failed to fetch rides: ${err.response?.status ? `Server error ${err.response.status}` : err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s.includes('progress') || s.includes('active') || s.includes('ongoing')) return 'bg-primary';
    if (s.includes('completed') || s.includes('done') || s.includes('resolved')) return 'bg-success';
    if (s.includes('cancel') || s.includes('failed')) return 'bg-danger';
    return 'bg-secondary';
  };

  const filteredRides = rides.filter((r) => {
    const matchesSearch = 
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.passenger.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.captain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status.toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRides.length / itemsPerPage) || 1;
  const paginatedRides = filteredRides.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (e, pageNumber) => {
    e.preventDefault();
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {selectedRide && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Ride Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRide(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center me-3 text-primary" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                    🚗
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold text-dark">{selectedRide.id}</h5>
                    <span className={`badge rounded-pill mt-2 ${getStatusBadge(selectedRide.status)}`}>
                      {selectedRide.status}
                    </span>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Passenger</small>
                      <span className="fw-bold text-dark">{selectedRide.passenger}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Captain</small>
                      <span className="fw-bold text-dark">{selectedRide.captain}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Pickup Location</small>
                      <span className="fw-medium text-dark d-block text-truncate" title={selectedRide.pickup}>{selectedRide.pickup}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Dropoff Location</small>
                      <span className="fw-medium text-dark d-block text-truncate" title={selectedRide.dropoff}>{selectedRide.dropoff}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-semibold">Final Fare</small>
                      <span className="fw-bold fs-5 text-dark">Rs. {selectedRide.fare}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary rounded-3 px-4 fw-medium" onClick={() => setSelectedRide(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-8 col-lg-6 mb-3 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Ride ID, Passenger, or Captain..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            disabled={loading}
          />
        </div>
        <div className="col-md-4 col-lg-3">
          <div className="dropdown" ref={dropdownRef}>
            <button 
              className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center bg-white" 
              type="button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={loading}
            >
              <span>{filterStatus === 'All' ? 'All Rides' : filterStatus}</span>
              <span className="dropdown-toggle"></span>
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-menu show w-100 shadow-sm border-0 mt-1" style={{ position: 'absolute', zIndex: 1000 }}>
                {['All', 'Pending', 'In-Progress', 'Completed', 'Canceled'].map((statusOption) => (
                  <li key={statusOption}>
                    <button 
                      className={`dropdown-item py-2 ${filterStatus === statusOption ? 'active bg-primary text-white' : ''}`} 
                      onClick={() => {
                        setFilterStatus(statusOption);
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {statusOption === 'All' ? 'All Rides' : statusOption}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-muted fw-semibold border-bottom">Ride ID</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Passenger</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Captain</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Pickup</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Dropoff</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Status</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Fare</th>
                  <th className="pe-4 py-3 text-muted fw-semibold border-bottom">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Loading ride data...
                    </td>
                  </tr>
                ) : paginatedRides.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No rides found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedRides.map((ride, index) => (
                    <tr key={index}>
                      <td className="ps-4 py-3 fw-medium text-secondary">{ride.id}</td>
                      <td className="py-3 text-dark">{ride.passenger}</td>
                      <td className="py-3 text-dark">{ride.captain}</td>
                      <td className="py-3 text-dark text-truncate" style={{ maxWidth: '150px' }} title={ride.pickup}>{ride.pickup}</td>
                      <td className="py-3 text-dark text-truncate" style={{ maxWidth: '150px' }} title={ride.dropoff}>{ride.dropoff}</td>
                      <td className="py-3">
                        <span
                          className={`badge rounded-pill ${getStatusBadge(ride.status)} px-3 py-2 fw-medium`}
                          style={{ minWidth: '90px' }}
                        >
                          {ride.status}
                        </span>
                      </td>
                      <td className="py-3 text-dark fw-medium">
                        {ride.fare > 0 ? `Rs. ${ride.fare}` : '0'}
                      </td>
                      <td className="pe-4 py-3">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary fw-medium"
                            onClick={() => setSelectedRide(ride)}
                          >
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-warning fw-medium"
                            onClick={() => navigate('/tickets', { state: { prefillTripId: ride.rawId } })}
                          >
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <nav aria-label="Rides pagination">
        <ul className="pagination justify-content-end mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a 
              className="page-link" 
              href="#" 
              onClick={(e) => handlePageChange(e, currentPage - 1)}
              tabIndex="-1" 
              aria-disabled={currentPage === 1}
            >
              Previous
            </a>
          </li>
          
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
              <a 
                className="page-link" 
                href="#"
                onClick={(e) => handlePageChange(e, i + 1)}
              >
                {i + 1}
              </a>
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a 
              className="page-link" 
              href="#"
              onClick={(e) => handlePageChange(e, currentPage + 1)}
              aria-disabled={currentPage === totalPages}
            >
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ActiveRides;
