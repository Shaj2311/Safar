import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import '../App.css';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const TripSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const ride = location.state?.ride;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBLCb5ePFZDzhY3B3lnT_hkFWE61qj1cWM'
    });

    const mapCenter = {
        lat: ride?.dropoff?.x || 31.5204,
        lng: ride?.dropoff?.y || 74.3587
    };

    return (
        <div className="mobile-frame">

            <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: '#cbd5e1' }}>

                {/* Fixed Map Background */}
                <div
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%',
                        backgroundColor: '#cbd5e1', zIndex: 0,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                >
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={mapCenter}
                            zoom={15}
                            options={{ disableDefaultUI: true, zoomControl: false }}
                        >
                            <Marker position={mapCenter} />
                        </GoogleMap>
                    ) : (
                        <div style={{ fontWeight: 'bold', color: '#4b5563' }}>Loading Map...</div>
                    )}
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


                    {/* Stats Box */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', backgroundColor: '#f3f4f6',
                        borderRadius: '16px', padding: '20px 16px', width: '100%', marginBottom: 'auto'
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>Distance</div>
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem' }}>{ride?.dist ?? 0} km</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1.2 }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>Total Fare</div>
                            <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.05rem' }}>Rs {ride?.dist ? ride.dist * 100 : 200}</div>
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
