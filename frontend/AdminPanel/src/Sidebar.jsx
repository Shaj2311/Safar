import React from 'react';
import { NavLink } from 'react-router-dom';

const ROLE_NAV = {
  support: ['tickets'],
  admin:   ['dashboard', 'rides', 'captains', 'passengers', 'tickets'],
  super:   ['dashboard', 'rides', 'captains', 'passengers', 'tickets', 'staff'],
};

const ALL_NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',           key: 'dashboard'  },
  { to: '/rides',      label: 'Rides Ledger',         key: 'rides'      },
  { to: '/captains',   label: 'Captain Management',   key: 'captains'   },
  { to: '/passengers', label: 'Passenger Management', key: 'passengers' },
  { to: '/tickets',    label: 'Complaints & Tickets', key: 'tickets'    },
  { to: '/staff',      label: 'Staff Management',     key: 'staff'      },
];

const Sidebar = () => {
  const role = localStorage.getItem('safar_admin_role') || 'support';
  // backend might send 'super_admin' so we normalise it
  const normalisedRole = role.includes('super') ? 'super' : role;
  const allowedKeys = ROLE_NAV[normalisedRole] || ROLE_NAV['support'];

  const navLinkClass = ({ isActive }) =>
    `d-block px-4 py-3 text-decoration-none fw-medium sidebar-link ${isActive ? 'active' : ''}`;

  const visibleItems = ALL_NAV_ITEMS.filter(item => allowedKeys.includes(item.key));

  return (
    <div
      className="d-flex flex-column bg-white border-end"
      style={{ width: '240px', minHeight: '100vh' }}
    >
      <div className="px-4 py-4 border-bottom d-flex justify-content-center">
        <img src="/safar-logo.svg" alt="Safar" style={{ height: '72px', width: 'auto' }} />
      </div>

      <nav className="d-flex flex-column pt-2">
        {visibleItems.map(item => (
          <NavLink key={item.key} to={item.to} className={navLinkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 py-3 border-top">
        <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary text-capitalize px-3 py-2 fw-medium" style={{ fontSize: '0.75rem' }}>
          {normalisedRole === 'super' ? 'Super Admin' : normalisedRole}
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
