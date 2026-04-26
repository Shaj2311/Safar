import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import '../App.css';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const TripDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const ride = location.state?.ride;

    const [isStarted, setIsStarted] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });
    const mapCenter = {
        lat: ride?.pickup?.x || 31.5204,
        lng: ride?.pickup?.y || 74.3587
    };

    const handleRideAction = async () => {
        try {
            if (!isStarted) {
                // TEMPORARILY COMMENTED OUT TO BYPASS BACKEND
                // await apiClient.patch(`/rides/${ride.tripId}/start`);
                setIsStarted(true);
            } else {
                // TEMPORARILY COMMENTED OUT TO BYPASS BACKEND
                // await apiClient.patch(`/rides/${ride.tripId}/end`);
                navigate('/trip-summary', { state: { ride } });
            }
        } catch (err) {
            console.error('Error updating ride status:', err);
        }
    };

    return (
        <div className="mobile-frame">

            <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: '#cbd5e1', display: 'flex', flexDirection: 'column' }}>

                {/* Fixed Map Area */}
                <div style={{ position: 'relative', flex: '1 1 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 0 }}>
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

                {/* Status Bar for Trip */}
                <div style={{ backgroundColor: '#8bdabe', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>{isStarted ? 'Trip in Progress' : 'Head to Pickup'}</span>
                    <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>{ride?.dist ?? 0} km left</span>
                </div>

                {/* Bottom Section (White) */}
                <div style={{ backgroundColor: '#fff', display: 'flex', flexDirection: 'column', height: '42%', zIndex: 10 }}>

                    {/* Passenger Info */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '24px' }}>
                        {/* Name */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem', lineHeight: '1.2' }}>
                                Passenger ID: {ride?.passengerId || ride?.id || 'N/A'}
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Passenger</div>
                        </div>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: '600', color: '#111827' }}>Text</div>
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: '600', color: '#111827' }}>Call</div>
                        </div>
                    </div>

                    {/* Destination Card */}
                    <div style={{ backgroundColor: '#f3f4f6', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', width: '80px' }}>Pickup</div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem', textAlign: 'right' }}>
                                Lat: {ride?.pickup?.x}, Lng: {ride?.pickup?.y}
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid #e5e7eb', width: '100%', margin: '4px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', width: '80px' }}>Dropoff</div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem', textAlign: 'right' }}>
                                Lat: {ride?.dropoff?.x}, Lng: {ride?.dropoff?.y}
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ padding: '24px', marginTop: 'auto', paddingBottom: '35px' }}>
                        <button
                            className="btn w-100 shadow-sm"
                            onClick={handleRideAction}
                            style={{
                                backgroundColor: isStarted ? '#ef4444' : '#20c997',
                                color: isStarted ? '#ffffff' : '#1F2937',
                                borderRadius: '25px', padding: '16px', fontWeight: 'bold', fontSize: '1.2rem', border: 'none'
                            }}
                        >
                            {isStarted ? 'End Ride' : 'Start Ride'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TripDashboard;
