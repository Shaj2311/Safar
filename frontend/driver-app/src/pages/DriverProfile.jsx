import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const DriverProfile = () => {
    const navigate = useNavigate();

    return (
        <div className="mobile-frame" style={{ backgroundColor: '#ffffff' }}>

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 24px 45px' }}>

                {/* Top Bar with X button */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                    <div
                        onClick={() => navigate('/home')}
                        style={{
                            width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#f3f4f6',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
                            fontSize: '1.4rem', fontWeight: 'bold', color: '#111827'
                        }}
                    >
                        ✕
                    </div>
                </div>

                {/* Profile Info */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingTop: '10px' }}>
                    <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '35px' }}>My Profile</h3>

                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#cdd3ff',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: '#111827', fontWeight: 'bold', fontSize: '3rem', marginBottom: '20px'
                    }}>
                        A
                    </div>

                    <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '10px', fontSize: '1.4rem' }}>Adnan</h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1rem', color: '#111827', fontWeight: 'bold' }}>
                        <span style={{ color: '#fbbf24', fontSize: '1.2rem', letterSpacing: '-2px' }}>⭐⭐⭐⭐⭐</span>
                        <span style={{ marginLeft: '6px' }}>5.0</span>
                    </div>

                    {/* Details Card */}
                    <div style={{
                        backgroundColor: '#f3f4f6', borderRadius: '15px', padding: '20px 15px',
                        display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '50px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>Vehicle</div>
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.9rem' }}>Mark X</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>License No.</div>
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.9rem' }}>RMA-0129</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1.2 }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>Phone No.</div>
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.9rem' }}>+92 3152734023</div>
                        </div>
                    </div>
                </div>

                {/* Log Out Button */}
                <div style={{ marginTop: 'auto' }}>
                    <button
                        className="btn w-100 shadow-sm btn-safar-primary"
                        onClick={() => navigate('/')}
                        style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '25px', padding: '16px', fontWeight: 'bold', fontSize: '1.2rem', border: 'none' }}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverProfile;
