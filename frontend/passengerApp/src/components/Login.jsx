import React, { useState } from 'react';
import { loginRequest, signupPassenger } from '../services/api';

export const Login = ({ setCurrentScreen }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [cnic, setCnic] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignup) {
        await signupPassenger({ name, password, phoneNo, cnic: cnic || null });
        await loginRequest({ name, password });
      } else {
        await loginRequest({ name, password });
      }
      localStorage.setItem('passengerName', name);
      setLoading(false);
      setCurrentScreen('home');
    } catch (err) {
      setError(isSignup ? 'Sign-up failed. Check your details.' : 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column h-100 px-4 bg-white w-100">
      <div className="safar-logo-container">
        <div className="safar-logo">
          <div className="d-flex align-items-center">
            <img src="/safar-logo.svg" alt="Safar Logo" style={{ height: '100px' }} />
          </div>
        </div>
      </div>

      <h3 className="text-center mb-5 fw-bold" style={{ color: '#2c3e50' }}>{isSignup ? 'Create Account' : 'Passenger App'}</h3>

      <form onSubmit={handleSubmit} className="flex-grow-1 d-flex flex-column">
        {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}
        
        <input
          type="text"
          className="safar-input"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        {isSignup && (
          <>
            <input
              type="text"
              className="safar-input"
              placeholder="Phone Number"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
            />
            <input
              type="text"
              className="safar-input"
              placeholder="CNIC (Optional)"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
            />
          </>
        )}

        <input
          type="password"
          className="safar-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="mt-4 mb-5">
          <button type="submit" className="btn btn-safar-primary w-100" disabled={loading}>
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Log In')}
          </button>
        </div>

        <div className="mt-auto mb-4 d-flex justify-content-between align-items-center">
          <span className="text-muted">{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
          <button 
            type="button" 
            className="btn btn-safar-primary px-4 rounded-pill"
            onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
            }}
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};
