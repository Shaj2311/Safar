import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

const TripDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const ride = location.state?.ride;

    const [tripState, setTripState] = useState('start'); // 'start' or 'end'

    const handleAction = () => {
        if (tripState === 'start') {
            setTripState('end');
        } else {
            navigate('/trip-summary', { state: { ride } });
        }
    };

    return (
        <div className="mobile-frame">

            <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: '#cbd5e1', display: 'flex', flexDirection: 'column' }}>

                {/* Fixed Map Area */}
                <div style={{ position: 'relative', flex: '1 1 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '40px' }}>📍</span>
                </div>

                {/* Status Bar for Trip */}
                <div style={{ backgroundColor: '#8bdabe', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>Trip in Progress</span>
                    <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>{ride?.distance || '3.1 km left'}</span>
                </div>

                {/* Bottom Section (White) */}
                <div style={{ backgroundColor: '#fff', display: 'flex', flexDirection: 'column', height: '42%', zIndex: 10 }}>

                    {/* Passenger Info */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '24px' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#cdd3ff',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#111827', fontWeight: 'bold', fontSize: '1.25rem', marginRight: '16px'
                        }}>
                            {ride?.riderName ? ride.riderName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        {/* Name */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem', lineHeight: '1.2' }}>
                                {ride?.riderName || 'Passenger'}
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
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem', textAlign: 'right' }}>{ride?.pickup || 'Pickup Location'}</div>
                        </div>
                        <div style={{ borderTop: '1px solid #e5e7eb', width: '100%', margin: '4px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', width: '80px' }}>Dropoff</div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem', textAlign: 'right' }}>{ride?.dropoff || 'Dropoff Location'}</div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ padding: '24px', marginTop: 'auto', paddingBottom: '35px' }}>
                        <button
                            className="btn w-100 shadow-sm"
                            onClick={handleAction}
                            style={{
                                backgroundColor: tripState === 'start' ? '#20c997' : '#ef4444',
                                color: tripState === 'start' ? '#1F2937' : '#ffffff',
                                borderRadius: '25px', padding: '16px', fontWeight: 'bold', fontSize: '1.2rem', border: 'none'
                            }}
                        >
                            {tripState === 'start' ? 'Start Ride' : 'End Trip'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TripDashboard;
