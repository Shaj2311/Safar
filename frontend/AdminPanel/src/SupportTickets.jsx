import React, { useState } from 'react';

const SupportTickets = () => {
  const [tickets] = useState([
    { id: '#TKT-301', reporter: 'Ali Khan', category: 'Billing', date: 'Apr 24, 2026', status: 'Open' },
    { id: '#TKT-302', reporter: 'Ahmed Raza', category: 'Driver Behavior', date: 'Apr 23, 2026', status: 'In Progress' },
    { id: '#TKT-303', reporter: 'Sara Ahmed', category: 'App Bug', date: 'Apr 23, 2026', status: 'Resolved' },
    { id: '#TKT-304', reporter: 'Ayesha Gul', category: 'Ride Cancellation', date: 'Apr 22, 2026', status: 'Open' },
    { id: '#TKT-305', reporter: 'Kamran Ali', category: 'Billing', date: 'Apr 22, 2026', status: 'In Progress' },
    { id: '#TKT-306', reporter: 'Hira Nadeem', category: 'Safety Concern', date: 'Apr 21, 2026', status: 'Resolved' },
    { id: '#TKT-307', reporter: 'Usman Tariq', category: 'App Bug', date: 'Apr 21, 2026', status: 'Open' },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return 'bg-danger';
      case 'In Progress': return 'bg-warning text-dark';
      case 'Resolved': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h2 className="m-0 fw-semibold text-dark">Support &amp; Complaints</h2>
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
            placeholder="Search by Ticket ID, Name, or Issue..."
          />
        </div>
        <div className="col-md-4 col-lg-3">
          <select className="form-select">
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-muted fw-semibold border-bottom">Ticket ID</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Reporter</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Issue Category</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Date</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Status</th>
                  <th className="pe-4 py-3 text-muted fw-semibold border-bottom">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => (
                  <tr key={index}>
                    <td className="ps-4 py-3 fw-medium text-secondary">{ticket.id}</td>
                    <td className="py-3 text-dark">{ticket.reporter}</td>
                    <td className="py-3 text-dark">{ticket.category}</td>
                    <td className="py-3 text-dark">{ticket.date}</td>
                    <td className="py-3">
                      <span
                        className={`badge rounded-pill ${getStatusBadge(ticket.status)} px-3 py-2 fw-medium`}
                        style={{ minWidth: '90px' }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="pe-4 py-3">
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-primary fw-medium">View Thread</button>
                        <button className="btn btn-sm btn-outline-success fw-medium">Mark Resolved</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <nav aria-label="Tickets pagination">
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

export default SupportTickets;
