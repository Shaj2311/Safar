import React, { useState } from 'react';

const PassengerManagement = () => {
  const [passengers] = useState([
    { id: '#PSG-012', name: 'Fatima Ali', phone: '0300-1234567', totalRides: 15, status: 'Banned' },
    { id: '#PSG-013', name: 'Usman Tariq', phone: '0311-9876543', totalRides: 42, status: 'Active' },
    { id: '#PSG-014', name: 'Ayesha Khan', phone: '0322-4567890', totalRides: 8, status: 'Active' },
    { id: '#PSG-015', name: 'Bilal Ahmed', phone: '0333-1122334', totalRides: 120, status: 'Banned' },
    { id: '#PSG-016', name: 'Sara Malik', phone: '0344-5566778', totalRides: 2, status: 'Active' },
    { id: '#PSG-017', name: 'Zain Abbas', phone: '0301-9988776', totalRides: 27, status: 'Active' },
    { id: '#PSG-018', name: 'Hira Nadeem', phone: '0321-4455667', totalRides: 56, status: 'Banned' },
  ]);

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h2 className="m-0 fw-semibold text-dark">Passenger Management</h2>
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-secondary bg-opacity-25"
            style={{ width: '40px', height: '40px' }}
          ></div>
          <button className="btn btn-outline-secondary btn-sm fw-medium">Log Out</button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8 col-lg-6 mb-3 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone, or ID..."
          />
        </div>
        <div className="col-md-4 col-lg-3">
          <select className="form-select">
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Banned">Banned</option>
          </select>
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
                {passengers.map((passenger, index) => (
                  <tr key={index}>
                    <td className="ps-4 py-3 fw-medium text-secondary">{passenger.id}</td>
                    <td className="py-3 text-dark">{passenger.name}</td>
                    <td className="py-3 text-dark">{passenger.phone}</td>
                    <td className="py-3 text-dark">{passenger.totalRides}</td>
                    <td className="py-3">
                      <span
                        className={`badge rounded-pill ${passenger.status === 'Active' ? 'bg-success' : 'bg-danger'} px-3 py-2 fw-medium`}
                        style={{ minWidth: '80px' }}
                      >
                        {passenger.status}
                      </span>
                    </td>
                    <td className="pe-4 py-3">
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary fw-medium">View</button>
                        <button className={`btn btn-sm fw-medium ${passenger.status === 'Active' ? 'btn-outline-danger' : 'btn-outline-success'}`}>
                          {passenger.status === 'Active' ? 'Ban' : 'Unban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <nav aria-label="Passenger pagination">
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

export default PassengerManagement;
