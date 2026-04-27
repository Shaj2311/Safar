import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

const CallPassenger = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const ride = location.state?.ride;
    // Use exact keys from Haider's backend: passengerPhoneNo and passengerName
    const phoneNumber = ride?.passengerPhoneNo || "0315403452";
    const passengerName = ride?.passengerName || "Passenger";

    return (
        <div className="mobile-frame" style={{ backgroundColor: '#1f1f1f' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>

                {/* Header Title */}
                <div style={{ color: '#9ca3af', fontSize: '1.2rem', marginBottom: '15px', paddingLeft: '10px' }}>
                    Call Passenger
                    {/* The screenshot says "Call Driver" but this is the Driver app calling a Passenger */}
                </div>

                {/* Content Card */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '40px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 24px'
                }}>

                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#64748b',
                        marginBottom: '10px',
                        textAlign: 'center'
                    }}>
                        Passenger Number
                    </div>

                    {/* Added: Passenger Name Display */}
                    <div style={{
                        fontSize: '1.2rem',
                        color: '#9ca3af',
                        marginBottom: '30px',
                        textAlign: 'center'
                    }}>
                        {passengerName}
                    </div>

                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: '#111827',
                        marginBottom: 'auto',
                        marginTop: '10px'
                    }}>
                        {phoneNumber}
                    </div>

                    {/* Return Button */}
                    <button
                        className="btn w-100 shadow-sm"
                        onClick={() => navigate('/trip-dashboard', { state: { ride } })}
                        style={{
                            backgroundColor: '#8bdabe',
                            color: '#111827',
                            borderRadius: '35px',
                            padding: '20px',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            border: 'none'
                        }}
                    >
                        Back to Trip Board
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallPassenger;
