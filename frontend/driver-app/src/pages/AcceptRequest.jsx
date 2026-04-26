import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import '../App.css';

const AcceptRequest = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initial fetch
        fetchIncomingRequests();

        // Setup polling every 7 seconds
        const pollInterval = setInterval(() => {
            fetchIncomingRequests();
        }, 7000);

        return () => clearInterval(pollInterval);
    }, []);

    const fetchIncomingRequests = async () => {
        try {
            const response = await apiClient.get('/drivers/incomingRequests');
            console.log("RAW DATA FROM BACKEND:", response.data);
            // Backend returns an array or an object with requests
            const data = Array.isArray(response.data) ? response.data : (response.data?.requests || []);

            // Sort by Newest tripId first
            const sortedByNewest = [...data].sort((a, b) => (b.tripId || 0) - (a.tripId || 0));
            setRequests(sortedByNewest);
        } catch (err) {
            console.error('Error fetching requests:', err);
        }
    };

    const handleAccept = async (tripId, request) => {
        setLoading(true);
        try {
            // Hit the live API
            await apiClient.patch(`/rides/${tripId}/accept`);

            // Navigate only on SUCCESS
            navigate('/trip-dashboard', { state: { ride: request } });
        } catch (err) {
            console.error('Error accepting ride:', err);
            alert('Failed to accept ride. It might have been taken by another driver.');
        } finally {
            setLoading(false);
        }
    };
    // Sort by tripId (descending) to show newest first, then by distance
    const sortedRequests = [...requests]
        .sort((a, b) => {
            // Primary sort: tripId (Newest first)
            const idA = a.tripId || a.id || 0;
            const idB = b.tripId || b.id || 0;
            if (idB !== idA) return idB - idA;

            // Secondary sort: distance (Shortest first)
            return (a.dist || 0) - (b.dist || 0);
        })
        .slice(0, 3);

    return (
        <div className="mobile-frame" style={{ backgroundColor: '#ffffff' }}>

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '25px 20px' }}>
                <h4 className="text-center mb-4 fw-bold" style={{ color: '#1f2937', fontSize: '1.25rem', marginTop: '20px' }}>
                    Available Requests
                </h4>

                {/* Scrollable List Container */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingBottom: '20px',
                    paddingRight: '5px',
                    msOverflowStyle: 'none', // Hide scrollbar IE/Edge
                    scrollbarWidth: 'none',   // Hide scrollbar Firefox
                    WebkitOverflowScrolling: 'touch' // Smooth touch scrolling
                }}>
                    {/* Hide Webkit Scrollbar */}
                    <style>
                        {`div::-webkit-scrollbar { display: none; }`}
                    </style>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {sortedRequests.length > 0 ? sortedRequests.map((req) => (
                            <div key={req.tripId || req.id} style={{
                                backgroundColor: '#f3f4f6', borderRadius: '16px', padding: '16px',
                                display: 'flex', flexDirection: 'column', gap: '12px',
                                border: '1px solid #e5e7eb'
                            }}>

                                {/* Header: Passenger ID & Price */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem' }}>
                                        Passenger ID: {req.passengerId || 'N/A'}
                                    </div>
                                    <div style={{ fontWeight: '900', color: '#10b981', fontSize: '1.1rem' }}>
                                        Rs {Math.round(req.dist * 100) || 200}
                                    </div>
                                </div>

                                {/* Route & Distance */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                                            Lat: {req.pickup?.x}, Lng: {req.pickup?.y}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                                            Lat: {req.dropoff?.x}, Lng: {req.dropoff?.y}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', backgroundColor: '#e5e7eb', padding: '4px 10px', borderRadius: '12px' }}>
                                        {req.dist} km
                                    </div>
                                </div>

                                {/* Accept Button */}
                                <button
                                    className="btn w-100 shadow-sm btn-safar-primary"
                                    disabled={loading}
                                    onClick={() => handleAccept(req.tripId, req)}
                                    style={{
                                        borderRadius: '25px', padding: '12px', fontWeight: 'bold', color: '#1F2937', marginTop: '4px'
                                    }}
                                >
                                    {loading ? 'Accepting...' : 'Accept'}
                                </button>
                            </div>
                        )) : (
                            <div className="text-center text-muted mt-5">
                                No requests available. Checking...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptRequest;
