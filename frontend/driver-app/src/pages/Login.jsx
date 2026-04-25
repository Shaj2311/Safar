import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';



const Login = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [cnic, setCnic] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Dummy login logic so you can test the Home screen layout
        setTimeout(() => {
            setLoading(false);
            navigate('/home');
        }, 500);
    };

    return (
        <div className="mobile-frame">
            <div className="d-flex flex-column h-100 bg-white w-100">

                <div className="px-4 d-flex flex-column flex-grow-1">
                    <div className="safar-logo-container">
                        <div className="safar-logo">
                            <div className="d-flex align-items-center">
                                {/* IMPORTANT: Drop your logo into the 'public' folder so this works! */}
                                <img
                                    src="/safar-logo.svg"
                                    alt="Safar Logo"
                                    style={{ height: '70px' }}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100.png?text=Logo'; }}
                                />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-center mb-4 fw-bold mt-3" style={{ color: '#2c3e50', fontSize: '1.25rem' }}>
                        {isSignup ? 'Create Account' : 'Driver App'}
                    </h3>

                    <form onSubmit={handleSubmit} className="d-flex flex-column">
                        {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}

                        <input
                            type="text"
                            className="safar-input"
                            placeholder="Driver Name"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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

                        <div className="mt-2 text-center text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px', textAlign: 'right' }}>
                            Forgot password?
                        </div>

                        <div className="mt-2">
                            <button
                                type="submit"
                                className="btn btn-safar-primary w-100"
                                disabled={loading}
                                style={{ padding: '14px', fontSize: '1.1rem' }}
                            >
                                {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Log In')}
                            </button>
                        </div>

                        <div className="mt-4 mb-2 d-flex justify-content-center align-items-center gap-2">
                            <span className="text-muted" style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                            </span>
                            <button
                                type="button"
                                className="btn px-4 rounded-pill fw-bold"
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setError(null);
                                }}
                                style={{ backgroundColor: '#8bdabe', color: '#111827', border: 'none', padding: '8px 20px' }}
                            >
                                {isSignup ? 'Log In' : 'Sign up'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;