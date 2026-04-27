import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import '../App.css';

const TripHistory = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // 1. Grab the logged-in driver's ID. 
                // (Update "driverId" if you saved it under a different name in localStorage like "user_id")
                const currentDriverId = localStorage.getItem('driverId');

                // 2. Send it to Haider's API as a query parameter
                const response = await apiClient.get('/history/rides', {
                    params: { driverId: currentDriverId }
                });

                // Check your console to see exactly what the array looks like!
                console.log(" History Data:", response.data);

                setTrips(response.data);
            } catch (err) {
                console.error('Error fetching trip history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="mobile-frame" style={{ backgroundColor: '#ffffff' }}>
            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '25px 20px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', marginTop: '20px' }}>
                    <div
                        onClick={() => navigate(-1)}
                        style={{
                            width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#f3f4f6',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
                            fontSize: '1.2rem', color: '#111827'
                        }}
                    >
                        ←
                    </div>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: '#111827', fontSize: '1.3rem' }}>
                        Trip History
                    </h4>
                </div>

                {/* History List */}
                <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                    {loading ? (
                        <div className="text-center text-muted mt-5">Loading history...</div>
                    ) : trips.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {trips.map((trip, index) => (
                                <div key={index} style={{
                                    backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6'
                                }}>
                                    <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.1rem' }}>
                                        {`Trip #${index + 1}`}
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1rem' }}>
                                        Rs. {trip.fare || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted mt-5">No past trips available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripHistory;
