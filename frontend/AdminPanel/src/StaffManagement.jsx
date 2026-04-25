import React, { useState } from 'react';
import api from './services/api';

const StaffManagement = () => {
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '', password: '', cnic: '', phone_no: '', role: 'admin'
  });

  const [deleteId, setDeleteId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

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
      setCreateSuccess(`Staff account for "${createForm.name}" created successfully as ${createForm.role}.`);
      setCreateForm({ name: '', password: '', cnic: '', phone_no: '', role: 'admin' });
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to create staff account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteStaff = async (e) => {
    e.preventDefault();
    const idNum = parseInt(deleteId, 10);
    if (!deleteId || isNaN(idNum)) {
      setDeleteError('Please enter a valid numeric Staff ID.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete staff member #${idNum}? This cannot be undone.`)) return;

    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      await api.delete(`/super/staff/${idNum}`);
      setDeleteSuccess(`Staff member #${idNum} has been deleted.`);
      setDeleteId('');
    } catch (err) {
      setDeleteError(err.response?.data?.detail || `Failed to delete staff member #${idNum}.`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="row g-4">

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center me-3 text-primary" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                  ➕
                </div>
                <div>
                  <h5 className="mb-0 fw-bold text-dark">Create Staff Account</h5>
                  <small className="text-muted">Create a new Admin or Support staff member</small>
                </div>
              </div>

              <form onSubmit={handleCreateStaff}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>Full Name</label>
                  <input type="text" name="name" className="form-control rounded-3" placeholder="e.g. Sara Khan" value={createForm.name} onChange={handleCreateFormChange} required disabled={createLoading} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>Phone Number</label>
                  <input type="text" name="phone_no" className="form-control rounded-3" placeholder="e.g. 03001234567" value={createForm.phone_no} onChange={handleCreateFormChange} required disabled={createLoading} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>CNIC</label>
                  <input type="text" name="cnic" className="form-control rounded-3" placeholder="e.g. 3420112345671" value={createForm.cnic} onChange={handleCreateFormChange} required disabled={createLoading} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>Initial Password</label>
                  <input type="password" name="password" className="form-control rounded-3" placeholder="Set a temporary password" value={createForm.password} onChange={handleCreateFormChange} required disabled={createLoading} />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>Role</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="role" id="role-admin" value="admin" checked={createForm.role === 'admin'} onChange={handleCreateFormChange} disabled={createLoading} />
                      <label className="form-check-label fw-medium" htmlFor="role-admin">Admin</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="role" id="role-support" value="support" checked={createForm.role === 'support'} onChange={handleCreateFormChange} disabled={createLoading} />
                      <label className="form-check-label fw-medium" htmlFor="role-support">Support</label>
                    </div>
                  </div>
                </div>

                {createError && <div className="alert alert-danger py-2 px-3 mb-3 rounded-3" style={{ fontSize: '0.875rem' }}>{createError}</div>}
                {createSuccess && <div className="alert alert-success py-2 px-3 mb-3 rounded-3" style={{ fontSize: '0.875rem' }}>{createSuccess}</div>}

                <button type="submit" className="btn btn-primary fw-medium w-100 py-2 rounded-3" disabled={createLoading}>
                  {createLoading ? <><span className="spinner-border spinner-border-sm me-2" />Creating Account...</> : '+ Create Staff Account'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center me-3 text-danger" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                  🗑
                </div>
                <div>
                  <h5 className="mb-0 fw-bold text-dark">Delete Staff Account</h5>
                  <small className="text-muted">Permanently remove a staff member by ID</small>
                </div>
              </div>

              <div className="alert alert-warning rounded-3 py-2 px-3 mb-4" style={{ fontSize: '0.875rem' }}>
                ⚠️ <strong>Caution:</strong> This permanently wipes the staff account from the database. You can find a staff member's ID from their login profile or the system logs.
              </div>

              <form onSubmit={handleDeleteStaff}>
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.875rem' }}>Staff Member ID</label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    placeholder="Enter numeric Staff ID, e.g. 12"
                    value={deleteId}
                    onChange={(e) => setDeleteId(e.target.value)}
                    min="1"
                    required
                    disabled={deleteLoading}
                  />
                </div>

                {deleteError && <div className="alert alert-danger py-2 px-3 mb-3 rounded-3" style={{ fontSize: '0.875rem' }}>{deleteError}</div>}
                {deleteSuccess && <div className="alert alert-success py-2 px-3 mb-3 rounded-3" style={{ fontSize: '0.875rem' }}>{deleteSuccess}</div>}

                <button type="submit" className="btn btn-danger fw-medium w-100 py-2 rounded-3" disabled={deleteLoading}>
                  {deleteLoading ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</> : '🗑 Delete Staff Account'}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffManagement;
