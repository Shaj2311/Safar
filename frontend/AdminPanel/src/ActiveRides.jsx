import React, { useState } from 'react';

const ActiveRides = () => {
  const [rides] = useState([
    { id: '#RDE-201', passenger: 'Ali Khan', captain: 'Ahmed Raza', pickup: 'Gulberg, Lahore', dropoff: 'DHA Phase 5', status: 'In-Progress', fare: 520 },
    { id: '#RDE-202', passenger: 'Sara Ahmed', captain: 'Kamran Ali', pickup: 'Johar Town', dropoff: 'Model Town', status: 'Completed', fare: 310 },
    { id: '#RDE-203', passenger: 'Usman Tariq', captain: 'Bilal Khan', pickup: 'Bahria Town', dropoff: 'Wapda Town', status: 'Canceled', fare: 0 },
    { id: '#RDE-204', passenger: 'Ayesha Gul', captain: 'Omar Farooq', pickup: 'Allama Iqbal Airport', dropoff: 'Cantt, Lahore', status: 'In-Progress', fare: 850 },
    { id: '#RDE-205', passenger: 'Omer Farooq', captain: 'Tariq Mehmood', pickup: 'Cavalry Ground', dropoff: 'Liberty Market', status: 'Completed', fare: 220 },
    { id: '#RDE-206', passenger: 'Hira Nadeem', captain: 'Saad Malik', pickup: 'Faisal Town', dropoff: 'Thokar Niaz Baig', status: 'Canceled', fare: 0 },
    { id: '#RDE-207', passenger: 'Zain Abbas', captain: 'Ahmed Raza', pickup: 'Shahdara', dropoff: 'Ichra Bazaar', status: 'In-Progress', fare: 390 },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In-Progress': return 'bg-primary';
      case 'Completed': return 'bg-success';
      case 'Canceled': return 'bg-danger';
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
            placeholder="Search by Ride ID, Passenger, or Captain..."
          />
        </div>
        <div className="col-md-4 col-lg-3">
          <select className="form-select">
            <option value="All">All</option>
            <option value="In-Progress">Live / In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>


      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-muted fw-semibold border-bottom">Ride ID</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Passenger</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Captain</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Pickup</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Dropoff</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Status</th>
                  <th className="py-3 text-muted fw-semibold border-bottom">Fare</th>
                  <th className="pe-4 py-3 text-muted fw-semibold border-bottom">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride, index) => (
                  <tr key={index}>
                    <td className="ps-4 py-3 fw-medium text-secondary">{ride.id}</td>
                    <td className="py-3 text-dark">{ride.passenger}</td>
                    <td className="py-3 text-dark">{ride.captain}</td>
                    <td className="py-3 text-dark">{ride.pickup}</td>
                    <td className="py-3 text-dark">{ride.dropoff}</td>
                    <td className="py-3">
                      <span
                        className={`badge rounded-pill ${getStatusBadge(ride.status)} px-3 py-2 fw-medium`}
                        style={{ minWidth: '90px' }}
                      >
                        {ride.status}
                      </span>
                    </td>
                    <td className="py-3 text-dark">
                      {ride.fare > 0 ? `Rs. ${ride.fare}` : '—'}
                    </td>
                    <td className="pe-4 py-3">
                      <button className="btn btn-sm btn-outline-primary fw-medium">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <nav aria-label="Rides pagination">
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

export default ActiveRides;
