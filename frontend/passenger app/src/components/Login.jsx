import React, { useState } from 'react';
import { loginRequest } from '../services/api';

export const Login = ({ setCurrentScreen }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginRequest({ name, password });
      setLoading(false);
      setCurrentScreen('home');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column h-100 px-4 bg-white w-100">
      <div className="safar-logo-container">
        <div className="safar-logo">
          <div className="d-flex align-items-center">
            <img
              src="/safar-logo.svg"
              alt="Safar Logo"
              style={{ height: '100px' }}
            />
          </div>
        </div>
      </div>

      <h3 className="text-center mb-5 fw-bold" style={{ color: '#2c3e50' }}>Passenger App</h3>

      <form onSubmit={handleLogin} className="flex-grow-1 d-flex flex-column">
        {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}
        <input
          type="text"
          className="safar-input"
          placeholder="Username or Phone Number"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="password"
          className="safar-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="mt-4 mb-5">
          <button
            type="submit"
            className="btn btn-safar-primary w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>

        <div className="mt-auto mb-4 d-flex justify-content-between align-items-center">
          <span className="text-muted">Don't have an account?</span>
          <button type="button" className="btn btn-safar-primary px-4 rounded-pill">Sign Up</button>
        </div>
      </form>
    </div>
  );
};
