import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

const TripSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const ride = location.state?.ride;

    return (
        <div className="mobile-frame">

            <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: '#cbd5e1' }}>

                {/* Fixed Map Background Placeholder with Emoji */}
                <div
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%',
                        backgroundColor: '#cbd5e1', zIndex: 0,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                >
                    <span style={{ fontSize: '40px' }}>📍</span>
                </div>

                {/* Bottom Sheet Card */}
                <div
                    style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                        backgroundColor: '#fff', borderTopLeftRadius: '35px', borderTopRightRadius: '35px',
                        padding: '35px 24px 45px', boxShadow: '0 -10px 30px rgba(0,0,0,0.08)',
                        zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}
                >
                    <h3 className="mb-2 fw-bold" style={{ color: '#1f2937' }}>
                        Trip Completed
                    </h3>
                    <div style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '20px', fontWeight: '600' }}>
                        {ride?.riderName || 'Passenger'}
                    </div>

                    {/* Stats Box */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', backgroundColor: '#f3f4f6',
                        borderRadius: '16px', padding: '20px 16px', width: '100%', marginBottom: 'auto'
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>Distance</div>
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem' }}>{ride?.distance || '0 km'}</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1.2 }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>Total Fare</div>
                            <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.05rem' }}>{ride?.price || 'Rs 0'}</div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        className="btn w-100 shadow-sm btn-safar-primary"
                        onClick={() => navigate('/payment', { state: { ride } })}
                        style={{ padding: '16px', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '25px', marginTop: '25px' }}
                    >
                        Collect Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TripSummary;
