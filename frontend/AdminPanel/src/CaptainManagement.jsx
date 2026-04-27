import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from './services/api';

const CaptainManagement = () => {
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const dropdownRef = useRef(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);


  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '', password: '', cnic: '', phoneNo: ''
  });


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCaptains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/staff/drivers');
      
      const rawCaptains = Array.isArray(response.data) 
        ? response.data 
        : (response.data.drivers || response.data.captains || response.data.data || []);

      const mappedCaptains = rawCaptains.map(c => ({
        rawId: c.id ?? c.driverId ?? c.user_id ?? null,
        id: `#CPT-${c.id ?? c.driverId ?? c.user_id ?? '???'}`,
        name: String(c.name || c.username || c.driver || 'Unknown'),
        phone: String(c.phone || c.phoneNumber || c.contact || 'N/A'),
        vehicle: 'Checking...' // Set a placeholder to trigger background fetching
      }));

      setCaptains(mappedCaptains);
    } catch (err) {
      setError(`Failed to fetch captains: ${err.response?.status ? `Server error ${err.response.status}` : err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptains();
  }, [fetchCaptains]);

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
      
    return matchesSearch;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredCaptains.length / itemsPerPage) || 1;
  const paginatedCaptains = filteredCaptains.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Background fetcher automatically fills in vehicle details for captains visible on the current page
  useEffect(() => {
    const fetchMissingVehicles = async () => {
      const captainsToFetch = paginatedCaptains.filter(c => c.vehicle === 'Checking...');
      
      for (const captain of captainsToFetch) {
        try {
          const profileRes = await api.get(`/users/${captain.rawId}/profile`);
          const data = profileRes.data;
          
          const carMake = data.make || '';
          const carModel = data.model || '';
          const carPlate = data.plate_no || '';
          
          const displayVehicle = (carMake || carModel || carPlate) 
            ? `${carMake} ${carModel} (${carPlate})`.trim().replace(' ()', '') 
            : 'No Vehicle Registered';
          
          setCaptains(prev => prev.map(c => 
            c.rawId === captain.rawId ? { ...c, vehicle: displayVehicle } : c
          ));
        } catch (err) {
          setCaptains(prev => prev.map(c => 
            c.rawId === captain.rawId ? { ...c, vehicle: 'Unknown' } : c
          ));
        }
      }
    };

    if (paginatedCaptains.length > 0) {
      fetchMissingVehicles();
    }
  }, [paginatedCaptains]);

  const handlePageChange = (e, pageNumber) => {
    e.preventDefault();
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleCloseModal = () => {
    setSelectedCaptain(null);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleDelete = async () => {
    if (!selectedCaptain?.rawId) return;
    if (!window.confirm(`Are you sure you want to delete captain ${selectedCaptain.id}? This cannot be undone.`)) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const role = sessionStorage.getItem('safar_admin_role') || 'admin';
      
      // Super Admin and Admin use different endpoints for deletion
      const endpoint = role === 'super' || role === 'super_admin'
        ? `/super/drivers/${selectedCaptain.rawId}`
        : `/admin/drivers/${selectedCaptain.rawId}`;
      await api.delete(endpoint);
      setActionSuccess('Captain deleted successfully.');
      fetchCaptains();
      setTimeout(() => handleCloseModal(), 1200);
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to delete captain.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateFormChange = (e) => {
    setCreateForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateError(null);
    setCreateSuccess(null);
    setCreateForm({ name: '', password: '', cnic: '', phoneNo: '' });
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      // Use signup route to bypass "Admin privilege required" errors for non-admin staff
      await api.post('/auth/signup/driver', createForm);
      setCreateSuccess('Driver account created successfully!');
      setCreateForm({ name: '', password: '', cnic: '', phoneNo: '' });
      fetchCaptains();
      setTimeout(() => handleCloseCreateModal(), 1500);
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to create driver account.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Captain Details / Manage Modal */}
      {selectedCaptain && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Captain Profile</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} disabled={actionLoading}></button>
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

      {/* Create Driver Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Create New Driver Account</h5>
                <button type="button" className="btn-close" onClick={handleCloseCreateModal} disabled={createLoading}></button>
              </div>
              <form onSubmit={handleCreateDriver}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control rounded-3"
                      placeholder="e.g. Ahmed Raza"
                      value={createForm.name}
                      onChange={handleCreateFormChange}
                      required
                      disabled={createLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>Phone Number</label>
                    <input
                      type="text"
                      name="phoneNo"
                      className="form-control rounded-3"
                      placeholder="e.g. 03001234567"
                      value={createForm.phoneNo}
                      onChange={handleCreateFormChange}
                      required
                      disabled={createLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>CNIC</label>
                    <input
                      type="text"
                      name="cnic"
                      className="form-control rounded-3"
                      placeholder="e.g. 3420112345671"
                      value={createForm.cnic}
                      onChange={handleCreateFormChange}
                      required
                      disabled={createLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>Initial Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control rounded-3"
                      placeholder="Set a temporary password"
                      value={createForm.password}
                      onChange={handleCreateFormChange}
                      required
                      disabled={createLoading}
                    />
                  </div>

                  {createError && (
                    <div className="alert alert-danger py-2 px-3 mb-0 rounded-3" style={{ fontSize: '0.875rem' }}>
                      {createError}
                    </div>
                  )}
                  {createSuccess && (
                    <div className="alert alert-success py-2 px-3 mb-0 rounded-3" style={{ fontSize: '0.875rem' }}>
                      {createSuccess}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top pt-2">
                  <button type="button" className="btn btn-outline-secondary fw-medium" onClick={handleCloseCreateModal} disabled={createLoading}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-medium px-4" disabled={createLoading}>
                    {createLoading ? <><span className="spinner-border spinner-border-sm me-1" /> Creating...</> : '+ Create Driver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4 align-items-center">
        <div className="col-md-9 col-lg-8 mb-3 mb-md-0">
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
        <div className="col-md-3 col-lg-4 text-md-end">
          <button
            className="btn btn-primary fw-medium"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Driver
          </button>
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
                      <td className="pe-4 py-3">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary fw-medium"
                            onClick={() => { setSelectedCaptain(captain); setActionError(null); setActionSuccess(null); }}
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
