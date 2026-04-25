import React, { useState } from 'react';
import api from './services/api';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const response = await api.post('/auth/login/staff', {
        name,
        password
      });

      // The backend will return the session key. Since the schema is empty in docs, 
      // we check a few common property names. We'll log it if we can't find it.
      const token = response.data.sessionKey || response.data.access_token || response.data.token || response.data;
      
      // Basic check to make sure token is a string/valid and not an empty object
      if (token && typeof token === 'string') {
        localStorage.setItem('safar_admin_token', token);
        onLogin();
      } else {
        console.warn("Login payload received:", response.data);
        setError('Login successful, but no valid token was found in the response. Check console.');
      }
      
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials or server error.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: '100vh' }}
    >
      <div className="w-100" style={{ maxWidth: '420px', padding: '0 16px' }}>
        <div className="card border-0 shadow-sm rounded-4 p-4">

          <div className="text-center mb-4 pt-2">
            <img src="/safar-logo.svg" alt="Safar" style={{ height: '64px', width: 'auto' }} />
            <h4 className="fw-bold mt-3 mb-0" style={{ color: '#1a1a2e' }}>Safar Admin Portal</h4>
            <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.875rem' }}>Sign in to manage the platform</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 rounded-3" style={{ fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>
                Username
              </label>
              <input
                type="text"
                className="form-control rounded-3 py-2"
                placeholder="admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium text-dark" style={{ fontSize: '0.875rem' }}>
                Password
              </label>
              <input
                type="password"
                className="form-control rounded-3 py-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn w-100 fw-semibold py-2 rounded-3 text-white d-flex justify-content-center align-items-center gap-2"
              style={{ backgroundColor: '#2ec4a9', border: 'none' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-muted mt-4 mb-1" style={{ fontSize: '0.8rem' }}>
            Safar Admin Panel &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
