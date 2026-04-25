import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from './services/api';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const dropdownRef = useRef(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [showEscalateInput, setShowEscalateInput] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/staff/tickets');
      const rawTickets = Array.isArray(response.data) 
        ? response.data 
        : (response.data.tickets || response.data.complaints || response.data.data || []);

      const mappedTickets = rawTickets.map(t => {
        const reporterName = t.tripId ? `Trip #${t.tripId}` : (t.staffId ? `Staff #${t.staffId}` : 'Unknown User');

        let cleanDate = String(t.date || t.created_at || t.createdAt || 'Recent');
        // backend sometimes sends microseconds, trim them off
        if (cleanDate.includes('.')) cleanDate = cleanDate.split('.')[0];

        const rawId = t.ticketId ?? t.id ?? t.ticket_id ?? null;

        return {
          rawId,
          id: `#TKT-${rawId ?? '???'}`,
          reporter: reporterName,
          category: String(t.desc || t.category || t.issue || t.subject || 'General Support'),
          date: cleanDate,
          status: String(t.status || t.state || 'Open')
        };
      });

      setTickets(mappedTickets);
    } catch (err) {
      setError(`Error: ${err.response?.status ? `Backend returned ${err.response.status}` : err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setActionError(null);
    setActionSuccess(null);
    setShowEscalateInput(false);
    setEscalateReason('');
  };

  const handleResolve = async () => {
    if (!selectedTicket?.rawId) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.patch(`/staff/tickets/${selectedTicket.rawId}/resolve`);
      setActionSuccess('Ticket resolved successfully.');
      fetchTickets();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to resolve ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTicket?.rawId) return;
    if (!window.confirm(`Are you sure you want to delete ticket ${selectedTicket.id}? This cannot be undone.`)) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.delete(`/staff/tickets/${selectedTicket.rawId}`);
      setActionSuccess('Ticket deleted successfully.');
      fetchTickets();
      setTimeout(() => handleCloseModal(), 1200);
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to delete ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedTicket?.rawId || !escalateReason.trim()) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.post(`/support/tickets/${selectedTicket.rawId}/escalate`, null, {
        params: { reason: escalateReason.trim() }
      });
      setActionSuccess('Ticket escalated successfully.');
      setShowEscalateInput(false);
      setEscalateReason('');
      fetchTickets();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to escalate ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s.includes('open') || s.includes('new') || s.includes('pending')) return 'bg-danger';
    if (s.includes('progress') || s.includes('active') || s.includes('escalated')) return 'bg-warning text-dark';
    if (s.includes('resolved') || s.includes('closed') || s.includes('done')) return 'bg-success';
    return 'bg-secondary';
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = 
      t.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || t.status.toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (e, pageNumber) => {
    e.preventDefault();
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const isResolved = selectedTicket && selectedTicket.status.toLowerCase().includes('resolved');
  const isEscalated = selectedTicket && selectedTicket.status.toLowerCase().includes('escalated');

  return (
    <div>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {selectedTicket && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Ticket Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} disabled={actionLoading}></button>
              </div>
              <div className="modal-body py-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center me-3 text-danger" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                    🎫
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold text-dark">{selectedTicket.category}</h5>
                    <span className="text-muted fw-medium">{selectedTicket.id}</span>
                  </div>
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Reporter ID</small>
                      <span className="fw-bold text-dark">{selectedTicket.reporter}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <small className="text-muted d-block mb-1 fw-semibold">Date Submitted</small>
                      <span className="fw-bold text-dark">{selectedTicket.date}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-semibold">Ticket Status</small>
                      <span className={`badge rounded-pill ${getStatusBadge(selectedTicket.status)} px-3 py-2 fw-medium`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>
                </div>

                {actionError && (
                  <div className="alert alert-danger py-2 px-3 mb-3 rounded-3" style={{ fontSize: '0.875rem' }}>
                    {actionError}
                  </div>
                )}
                {actionSuccess && (
                  <div className="alert alert-success py-2 px-3 mb-3 rounded-3" style={{ fontSize: '0.875rem' }}>
                    {actionSuccess}
                  </div>
                )}

                {showEscalateInput && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>Escalation Reason</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Describe the reason for escalation..."
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      disabled={actionLoading}
                    />
                    <div className="d-flex gap-2 mt-2">
                      <button
                        className="btn btn-warning fw-medium btn-sm"
                        onClick={handleEscalate}
                        disabled={actionLoading || !escalateReason.trim()}
                      >
                        {actionLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                        Confirm Escalate
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm fw-medium"
                        onClick={() => { setShowEscalateInput(false); setEscalateReason(''); }}
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top pt-2 d-flex flex-wrap gap-2">
                {!isResolved && !showEscalateInput && (
                  <button
                    className="btn btn-success fw-medium"
                    onClick={handleResolve}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    ✔ Resolve
                  </button>
                )}

                {!isResolved && !isEscalated && !showEscalateInput && (
                  <button
                    className="btn btn-warning fw-medium"
                    onClick={() => setShowEscalateInput(true)}
                    disabled={actionLoading}
                  >
                    ⬆ Escalate
                  </button>
                )}

                {!showEscalateInput && (
                  <button
                    className="btn btn-outline-danger fw-medium"
                    onClick={handleDelete}
                    disabled={actionLoading}
                  >
                    🗑 Delete
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary rounded-3 px-4 fw-medium ms-auto"
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                >
                  Close
                </button>
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
            placeholder="Search by Ticket ID, Name, or Issue..."
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
              <span>{filterStatus === 'All' ? 'All Tickets' : filterStatus}</span>
              <span className="dropdown-toggle"></span>
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-menu show w-100 shadow-sm border-0 mt-1" style={{ position: 'absolute', zIndex: 1000 }}>
                {['All', 'Open', 'In Progress', 'Escalated', 'Resolved'].map((statusOption) => (
                  <li key={statusOption}>
                    <button 
                      className={`dropdown-item py-2 ${filterStatus === statusOption ? 'active bg-primary text-white' : ''}`} 
                      onClick={() => {
                        setFilterStatus(statusOption);
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {statusOption === 'All' ? 'All Tickets' : statusOption}
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
                  <th className="ps-4 py-3 text-muted fw-semibold border-bottom">Ticket ID</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Reporter ID</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Issue Category</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Date</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Status</th>
                  <th className="pe-4 py-3 text-muted fw-semibold border-bottom">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Loading ticket data...
                    </td>
                  </tr>
                ) : paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No tickets found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket, index) => (
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
                          <button 
                            className="btn btn-sm btn-outline-primary fw-medium"
                            onClick={() => { setSelectedTicket(ticket); setActionError(null); setActionSuccess(null); }}
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

      <nav aria-label="Tickets pagination">
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

export default SupportTickets;
