import React, { useState, useEffect, useRef } from 'react';
import api from './services/api';

const CaptainManagement = () => {
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State variables for Search, Filter, and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States for the UI components
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCaptains = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/staff/drivers');
        
        // Defensive check in case the backend wraps the array
        const rawCaptains = Array.isArray(response.data) 
          ? response.data 
          : (response.data.drivers || response.data.captains || response.data.data || []);

        // Safely map the backend payload using fallback properties
        const mappedCaptains = rawCaptains.map(c => ({
          id: `#CPT-${c.id ?? c.driverId ?? c.user_id ?? '???'}`,
          name: String(c.name || c.username || c.driver || 'Unknown'),
          phone: String(c.phone || c.phoneNumber || c.contact || 'N/A'),
          vehicle: String(c.vehicle || c.carModel || c.car || c.licensePlate || 'Not Assigned'),
          status: String(c.status || c.state || 'Pending')
        }));

        setCaptains(mappedCaptains);
      } catch (err) {
        console.error("Error fetching captains:", err);
        setError(`Error: ${err.response?.status ? `Backend returned ${err.response.status}` : err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCaptains();
  }, []);

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s.includes('approved') || s.includes('active')) return 'bg-success';
    if (s.includes('pending') || s.includes('verification')) return 'bg-warning text-dark';
    if (s.includes('banned') || s.includes('suspended')) return 'bg-danger';
    return 'bg-secondary';
  };

  // Filter captains based on Search and Dropdown
  const filteredCaptains = captains.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Allow partial matching for the filter since backend status might vary (e.g. "Pending" vs "Pending Verification")
    const matchesStatus = filterStatus === 'All' || c.status.toLowerCase().includes(filterStatus.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredCaptains.length / itemsPerPage) || 1;
  const paginatedCaptains = filteredCaptains.slice(
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

      {/* Captain Details Modal */}
      {selectedCaptain && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Captain Profile</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedCaptain(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="rounded-circle bg-warning bg-opacity-10 d-flex justify-content-center align-items-center me-3 text-warning" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                    {selectedCaptain.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold text-dark">{selectedCaptain.name}</h5>
                    <span className="text-muted fw-medium">{selectedCaptain.id}</span>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Phone Number</small>
                      <span className="fw-bold text-dark">{selectedCaptain.phone}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Vehicle Assignment</small>
                      <span className="fw-bold text-dark">{selectedCaptain.vehicle}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-semibold">Account Status</small>
                      <span className={`badge rounded-pill ${getStatusBadge(selectedCaptain.status)} px-3 py-2 fw-medium`}>
                        {selectedCaptain.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary rounded-3 px-4 fw-medium" onClick={() => setSelectedCaptain(null)}>Close</button>
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
            placeholder="Search by name, phone, vehicle or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            disabled={loading}
          />
        </div>
        <div className="col-md-4 col-lg-3">
          {/* Custom Bootstrap Dropdown replacing native <select> */}
          <div className="dropdown" ref={dropdownRef}>
            <button 
              className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center bg-white" 
              type="button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={loading}
            >
              <span>{filterStatus === 'All' ? 'All Captains' : filterStatus}</span>
              <span className="dropdown-toggle"></span>
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-menu show w-100 shadow-sm border-0 mt-1" style={{ position: 'absolute', zIndex: 1000 }}>
                {['All', 'Approved', 'Pending'].map((statusOption) => (
                  <li key={statusOption}>
                    <button 
                      className={`dropdown-item py-2 ${filterStatus === statusOption ? 'active bg-primary text-white' : ''}`} 
                      onClick={() => {
                        setFilterStatus(statusOption);
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {statusOption === 'All' ? 'All Captains' : statusOption}
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
                  <th className="ps-4 py-3 text-muted fw-semibold border-bottom">Captain ID</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Name</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Phone Number</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Vehicle</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Status</th>
                  <th className="pe-4 py-3 text-muted fw-semibold border-bottom">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Loading captain data...
                    </td>
                  </tr>
                ) : paginatedCaptains.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No captains found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedCaptains.map((captain, index) => (
                    <tr key={index}>
                      <td className="ps-4 py-3 fw-medium text-secondary">{captain.id}</td>
                      <td className="py-3 text-dark">{captain.name}</td>
                      <td className="py-3 text-dark">{captain.phone}</td>
                      <td className="py-3 text-dark">{captain.vehicle}</td>
                      <td className="py-3">
                        <span
                          className={`badge rounded-pill ${getStatusBadge(captain.status)} px-3 py-2 fw-medium`}
                          style={{ minWidth: '80px' }}
                        >
                          {captain.status}
                        </span>
                      </td>
                      <td className="pe-4 py-3">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary fw-medium"
                            onClick={() => setSelectedCaptain(captain)}
                          >
                            View
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

      <nav aria-label="Captain pagination">
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

export default CaptainManagement;
