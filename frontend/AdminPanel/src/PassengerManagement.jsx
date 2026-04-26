import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from './services/api';

const PassengerManagement = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const dropdownRef = useRef(null);


  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPassengers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/staff/passengers');
      
      const rawPassengers = Array.isArray(response.data) 
        ? response.data 
        : (response.data.passengers || response.data.data || []);

      const mappedPassengers = rawPassengers.map(p => ({
        rawId: p.id ?? p.passengerId ?? p.user_id ?? null,
        id: `#PSG-${p.id ?? p.passengerId ?? p.user_id ?? '???'}`,
        name: String(p.name || p.username || p.passenger || 'Unknown'),
        phone: String(p.phone || p.phoneNumber || p.contact || 'N/A'),
        totalRides: p.totalRides || p.total_trips || p.trips || 0,
        status: String(p.status || p.state || 'Active')
      }));

      setPassengers(mappedPassengers);
    } catch (err) {
      console.error("Error fetching passengers:", err);
      setError("Failed to load passenger data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  const filteredPassengers = passengers.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPassengers.length / itemsPerPage) || 1;
  const paginatedPassengers = filteredPassengers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (e, pageNumber) => {
    e.preventDefault();
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleCloseModal = () => {
    setSelectedPassenger(null);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleDelete = async () => {
    if (!selectedPassenger?.rawId) return;
    if (!window.confirm(`Are you sure you want to delete passenger ${selectedPassenger.id}? This cannot be undone.`)) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const role = sessionStorage.getItem('safar_admin_role') || 'admin';
      // super admin uses a different hard-delete route
      const endpoint = role === 'super' || role === 'super_admin'
        ? `/super/passengers/${selectedPassenger.rawId}`
        : `/admin/passengers/${selectedPassenger.rawId}`;
      await api.delete(endpoint);
      setActionSuccess('Passenger deleted successfully.');
      fetchPassengers();
      setTimeout(() => handleCloseModal(), 1200);
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to delete passenger.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}


      {selectedPassenger && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Passenger Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} disabled={actionLoading}></button>
              </div>
              <div className="modal-body py-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center me-3 text-primary" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                    {selectedPassenger.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold text-dark">{selectedPassenger.name}</h5>
                    <span className="text-muted fw-medium">{selectedPassenger.id}</span>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Phone Number</small>
                      <span className="fw-bold text-dark">{selectedPassenger.phone}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Total Rides</small>
                      <span className="fw-bold text-dark">{selectedPassenger.totalRides}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-semibold">Account Status</small>
                      <span className="badge bg-success rounded-pill px-3 py-2 fw-medium">{selectedPassenger.status}</span>
                    </div>
                  </div>
                </div>

                {actionError && (
                  <div className="alert alert-danger py-2 px-3 mt-3 mb-0 rounded-3" style={{ fontSize: '0.875rem' }}>
                    {actionError}
                  </div>
                )}
                {actionSuccess && (
                  <div className="alert alert-success py-2 px-3 mt-3 mb-0 rounded-3" style={{ fontSize: '0.875rem' }}>
                    {actionSuccess}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top pt-2">
                <button
                  className="btn btn-outline-danger fw-medium"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  {actionLoading ? <span className="spinner-border spinner-border-sm me-1" /> : '🗑 '}
                  Delete
                </button>
                <button type="button" className="btn btn-secondary rounded-3 px-4 fw-medium ms-auto" onClick={handleCloseModal} disabled={actionLoading}>Close</button>
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
            placeholder="Search by name, phone, or ID..."
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
              <span>{filterStatus === 'All' ? 'All Passengers' : 'Active Passengers'}</span>
              <span className="dropdown-toggle"></span>
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-menu show w-100 shadow-sm border-0 mt-1" style={{ position: 'absolute', zIndex: 1000 }}>
                <li>
                  <button 
                    className={`dropdown-item py-2 ${filterStatus === 'All' ? 'active bg-primary text-white' : ''}`} 
                    onClick={() => {
                      setFilterStatus('All');
                      setCurrentPage(1);
                      setIsDropdownOpen(false);
                    }}
                  >
                    All Passengers
                  </button>
                </li>
                <li>
                  <button 
                    className={`dropdown-item py-2 ${filterStatus === 'Active' ? 'active bg-primary text-white' : ''}`} 
                    onClick={() => {
                      setFilterStatus('Active');
                      setCurrentPage(1);
                      setIsDropdownOpen(false);
                    }}
                  >
                    Active Passengers
                  </button>
                </li>
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
                  <th className="ps-4 py-3 text-muted fw-semibold border-bottom">Passenger ID</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Name</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Phone Number</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Total Rides</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Status</th>
                  <th className="pe-4 py-3 text-muted fw-semibold border-bottom">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Loading passenger data...
                    </td>
                  </tr>
                ) : paginatedPassengers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No passengers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedPassengers.map((passenger, index) => (
                    <tr key={index}>
                      <td className="ps-4 py-3 fw-medium text-secondary">{passenger.id}</td>
                      <td className="py-3 text-dark">{passenger.name}</td>
                      <td className="py-3 text-dark">{passenger.phone}</td>
                      <td className="py-3 text-dark">{passenger.totalRides}</td>
                      <td className="py-3">
                        <span
                          className="badge rounded-pill bg-success px-3 py-2 fw-medium"
                          style={{ minWidth: '80px' }}
                        >
                          {passenger.status}
                        </span>
                      </td>
                      <td className="pe-4 py-3">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary fw-medium"
                            onClick={() => { setSelectedPassenger(passenger); setActionError(null); setActionSuccess(null); }}
                          >
                            Manage
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

      <nav aria-label="Passenger pagination">
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

export default PassengerManagement;
