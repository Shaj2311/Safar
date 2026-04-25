import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

const PaymentScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const ride = location.state?.ride;

    return (
        <div className="mobile-frame" style={{ backgroundColor: '#ffffff' }}>

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 24px 45px' }}>

                {/* Center Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ color: '#6b7280', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
                        Amount Due
                    </div>
                    <div style={{ color: '#0f766e', fontWeight: '900', fontSize: '4rem', letterSpacing: '-1px' }}>
                        {ride?.price || 'Rs 0'}
                    </div>
                </div>

                {/* Bottom Button */}
                <button
                    className="btn w-100 shadow-sm btn-safar-primary"
                    onClick={() => navigate('/home')}
                    style={{ padding: '16px', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '25px' }}
                >
                    Payment Received
                </button>
            </div>
        </div>
    );
};

export default PaymentScreen;
