import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import '../App.css';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 31.5204,
    lng: 74.3587
};

const Home = () => {
    const navigate = useNavigate();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    return (
        <div className="mobile-frame">

            <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: '#cbd5e1' }}>

                {/* Fixed Map Background */}
                <div
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: '#cbd5e1', zIndex: 0,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                >
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={14}
                            options={{ disableDefaultUI: true, zoomControl: false }}
                        />
                    ) : (
                        <div style={{ fontWeight: 'bold', color: '#4b5563' }}>Loading Map...</div>
                    )}
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