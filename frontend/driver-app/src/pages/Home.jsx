import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="mobile-frame">

            <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: '#cbd5e1' }}>

                {/* Fixed Map Background Placeholder with Map Pin Emoji */}
                <div
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: '#cbd5e1', zIndex: 0,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                >
                    <span style={{ fontSize: '40px' }}>📍</span>
                </div>

                {/* Hamburger Menu Icon */}
                <div
                    className="shadow-sm"
                    onClick={() => navigate('/profile')}
                    style={{
                        position: 'absolute', top: '70px', left: '20px', zIndex: 10,
                        backgroundColor: '#ffffff', borderRadius: '8px', width: '45px', height: '40px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', gap: '5px',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    <div style={{ width: '22px', height: '2.5px', backgroundColor: '#111827', borderRadius: '1px' }}></div>
                    <div style={{ width: '22px', height: '2.5px', backgroundColor: '#111827', borderRadius: '1px' }}></div>
                    <div style={{ width: '22px', height: '2.5px', backgroundColor: '#111827', borderRadius: '1px' }}></div>
                </div>

                {/* Bottom Sheet Card */}
                <div
                    style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        backgroundColor: '#fff', borderTopLeftRadius: '35px', borderTopRightRadius: '35px',
                        padding: '30px 24px 45px', boxShadow: '0 -10px 30px rgba(0,0,0,0.08)',
                        zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}
                >
                    <h4 className="mb-4 fw-bold" style={{ color: '#1f2937' }}>
                        Ready to earn?
                    </h4>

                    <button
                        className="w-100 fw-bold shadow-sm btn-safar-primary"
                        onClick={() => navigate('/accept-request')}
                        style={{
                            backgroundColor: '#20c997',
                            padding: '16px', fontSize: '1.2rem', color: '#1f2937', transition: 'all 0.3s ease'
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;