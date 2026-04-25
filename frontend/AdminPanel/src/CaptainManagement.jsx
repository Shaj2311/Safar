import React, { useState } from 'react';

const CaptainManagement = () => {
  const [captains] = useState([
    { id: '#CPT-101', name: 'Ahmed Raza', phone: '0300-1122334', vehicle: 'Toyota Corolla — ABC-123', status: 'Approved' },
    { id: '#CPT-102', name: 'Kamran Ali', phone: '0311-5566778', vehicle: 'Honda Civic — XYZ-456', status: 'Pending Verification' },
    { id: '#CPT-103', name: 'Bilal Khan', phone: '0322-9988776', vehicle: 'Suzuki Alto — LMN-789', status: 'Approved' },
    { id: '#CPT-104', name: 'Saad Malik', phone: '0333-4433221', vehicle: 'Toyota Yaris — PQR-321', status: 'Pending Verification' },
    { id: '#CPT-105', name: 'Omar Farooq', phone: '0344-7766554', vehicle: 'Kia Picanto — DEF-654', status: 'Approved' },
    { id: '#CPT-106', name: 'Tariq Mehmood', phone: '0301-2233445', vehicle: 'Suzuki Wagon R — GHI-987', status: 'Pending Verification' },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'bg-success';
      case 'Pending Verification': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <div>

      <div className="row mb-4">
        <div className="col-md-8 col-lg-6 mb-3 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone, or vehicle..."
          />
        </div>
        <div className="col-md-4 col-lg-3">
          <select className="form-select">
            <option value="All">All</option>
            <option value="Approved">Approved</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>
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
                {captains.map((captain, index) => (
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
                        <button className="btn btn-sm btn-outline-primary fw-medium">View Docs</button>
                        <button className="btn btn-sm btn-outline-danger fw-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <nav aria-label="Captain pagination">
        <ul className="pagination justify-content-end mb-0">
          <li className="page-item disabled">
            <a className="page-link" href="#" tabIndex="-1" aria-disabled="true">Previous</a>
          </li>
          <li className="page-item active" aria-current="page">
            <a className="page-link" href="#">1</a>
          </li>
          <li className="page-item"><a className="page-link" href="#">2</a></li>
          <li className="page-item"><a className="page-link" href="#">3</a></li>
          <li className="page-item">
            <a className="page-link" href="#">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default CaptainManagement;
