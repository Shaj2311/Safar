import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navLinkClass = ({ isActive }) =>
    `d-block px-4 py-3 text-decoration-none fw-medium sidebar-link ${isActive ? 'active' : ''}`;

  return (
    <div
      className="d-flex flex-column bg-white border-end"
      style={{ width: '240px', minHeight: '100vh' }}
    >
      <div className="px-4 py-4 border-bottom">
        <span className="fw-bold fs-5" style={{ color: '#2ec4a9' }}>Safar Admin</span>
      </div>

      <nav className="d-flex flex-column pt-2">
        <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
        <NavLink to="/rides" className={navLinkClass}>Rides Ledger</NavLink>
        <NavLink to="/captains" className={navLinkClass}>Captain Management</NavLink>
        <NavLink to="/passengers" className={navLinkClass}>Passenger Management</NavLink>
        <NavLink to="/tickets" className={navLinkClass}>Complaints &amp; Tickets</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
