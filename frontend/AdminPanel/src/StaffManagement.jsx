import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from './services/api';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const dropdownRef = useRef(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '', password: '', cnic: '', phone_no: '', role: 'admin'
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

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/super/staff');
      console.log('DEBUG: Raw Staff Data from Backend:', response.data);
      const rawStaff = Array.isArray(response.data) ? response.data : (response.data.staff || []);

      const mappedStaff = rawStaff.map(s => ({
        rawId: s.id ?? s.staff_id ?? s.userId ?? s.user_id, // prioritize 'id' if it exists
        id: `#STF-${s.staff_id || s.id}`,
        name: s.name,
        phone: s.phone_no,
        cnic: s.cnic,
        role: s.role // 'admin' or 'support'
      }));

      setStaff(mappedStaff);
    } catch (err) {
      setError("Failed to load staff records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreateFormChange = (e) => {
    setCreateForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      await api.post('/super/staff', createForm);
      setCreateSuccess('Staff account created successfully!');
      fetchStaff();
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateForm({ name: '', password: '', cnic: '', phone_no: '', role: 'admin' });
        setCreateSuccess(null);
      }, 1500);
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to create staff account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff?.rawId) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedStaff.name}?`)) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.delete(`/super/staff/${selectedStaff.rawId}`);
      setActionSuccess('Account deleted successfully.');
      fetchStaff();
      setTimeout(() => {
        setSelectedStaff(null);
        setActionSuccess(null);
      }, 1200);
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to delete staff member.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || s.role === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Manage Staff Modal */}
      {selectedStaff && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Staff Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedStaff(null)} disabled={actionLoading}></button>
              </div>
              <div className="modal-body py-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center me-3 text-primary" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                    👤
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{selectedStaff.name}</h5>
                    <span className="text-muted small">{selectedStaff.id}</span>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1 fw-semibold">Phone Number</small>
                      <span className="fw-bold">{selectedStaff.phone}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1 fw-semibold">CNIC</small>
                      <span className="fw-bold">{selectedStaff.cnic}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-semibold">Current Role</small>
                      <span className={`badge rounded-pill px-3 py-2 text-capitalize ${selectedStaff.role === 'admin' ? 'bg-primary' : 'bg-info text-dark'}`}>
                        {selectedStaff.role}
                      </span>
                    </div>
                  </div>
                </div>

                {actionError && <div className="alert alert-danger mt-3 mb-0 py-2">{actionError}</div>}
                {actionSuccess && <div className="alert alert-success mt-3 mb-0 py-2">{actionSuccess}</div>}
              </div>
              <div className="modal-footer border-top pt-2">
                <button className="btn btn-outline-danger fw-medium" onClick={handleDeleteStaff} disabled={actionLoading}>
                  {actionLoading ? <span className="spinner-border spinner-border-sm me-1" /> : '🗑 '} Delete Account
                </button>
                <button className="btn btn-secondary px-4 ms-auto" onClick={() => setSelectedStaff(null)} disabled={actionLoading}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Create New Staff Account</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} disabled={createLoading}></button>
              </div>
              <form onSubmit={handleCreateStaff}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Full Name</label>
                    <input type="text" name="name" className="form-control" placeholder="Sara Khan" value={createForm.name} onChange={handleCreateFormChange} required disabled={createLoading} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Phone Number</label>
                    <input type="text" name="phone_no" className="form-control" placeholder="03001234567" value={createForm.phone_no} onChange={handleCreateFormChange} required disabled={createLoading} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">CNIC</label>
                    <input type="text" name="cnic" className="form-control" placeholder="3420112345671" value={createForm.cnic} onChange={handleCreateFormChange} required disabled={createLoading} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Password</label>
                    <input type="password" name="password" className="form-control" placeholder="••••••••" value={createForm.password} onChange={handleCreateFormChange} required disabled={createLoading} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Account Role</label>
                    <div className="d-flex gap-3">
                      {['admin', 'support'].map(r => (
                        <div className="form-check" key={r}>
                          <input className="form-check-input" type="radio" name="role" id={`role-${r}`} value={r} checked={createForm.role === r} onChange={handleCreateFormChange} disabled={createLoading} />
                          <label className="form-check-label text-capitalize" htmlFor={`role-${r}`}>{r}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {createError && <div className="alert alert-danger py-2">{createError}</div>}
                  {createSuccess && <div className="alert alert-success py-2">{createSuccess}</div>}
                </div>
                <div className="modal-footer border-top pt-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)} disabled={createLoading}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={createLoading}>
                    {createLoading ? 'Creating...' : '+ Create Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main UI Controls */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-5 mb-3 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone, or ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            disabled={loading}
          />
        </div>
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="dropdown" ref={dropdownRef}>
            <button className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center bg-white" onClick={() => setIsDropdownOpen(!isDropdownOpen)} disabled={loading}>
              <span>{filterRole === 'All' ? 'All Roles' : filterRole}</span>
              <span className="dropdown-toggle"></span>
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-menu show w-100 shadow-sm border-0 mt-1">
                {['All', 'Admin', 'Support'].map((r) => (
                  <li key={r}>
                    <button className={`dropdown-item ${filterRole === r ? 'active bg-primary' : ''}`} onClick={() => { setFilterRole(r); setCurrentPage(1); setIsDropdownOpen(false); }}>{r}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="col-md-4 text-md-end">
          <button className="btn btn-primary fw-medium" onClick={() => setShowCreateModal(true)}>+ Create Staff Account</button>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-muted fw-semibold border-bottom">Staff ID</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Name</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Phone</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Role</th>
                  <th className="pe-4 py-3 text-muted fw-semibold border-bottom">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Loading records...</td></tr>
                ) : paginatedStaff.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No staff records found.</td></tr>
                ) : (
                  paginatedStaff.map((s, index) => (
                    <tr key={index}>
                      <td className="ps-4 py-3 fw-medium text-secondary">{s.id}</td>
                      <td className="py-3 fw-bold">{s.name}</td>
                      <td className="py-3">{s.phone}</td>
                      <td className="py-3">
                        <span className={`badge rounded-pill px-3 py-2 text-capitalize ${s.role === 'admin' ? 'bg-primary' : 'bg-info text-dark'}`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="pe-4 py-3">
                        <button className="btn btn-sm btn-outline-primary fw-medium" onClick={() => setSelectedStaff(s)}>Manage</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <nav>
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default StaffManagement;
