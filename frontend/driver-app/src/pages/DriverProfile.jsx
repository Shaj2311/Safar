import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import '../App.css';

const DriverProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            const myId = localStorage.getItem('driverId');
            if (!myId) return;

            // Fetch Profile
            try {
                const profileRes = await apiClient.get('/drivers/me', {
                    params: { id: myId }
                });
                console.log("Profile Data:", profileRes.data);

                // Initialize profile state with basic data
                let profileData = { ...profileRes.data };

                // Fetch Rating (Wrapped in its own try/catch)
                try {
                    const ratingRes = await apiClient.get(`/users/${myId}/ratings`);
                    console.log("Rating Data:", ratingRes.data);
                    // Update state with rating if it exists
                    profileData.rating = ratingRes.data?.rating || ratingRes.data?.averageRating || null;
                } catch (ratingErr) {
                    console.error("Error fetching ratings (non-blocking):", ratingErr);
                }

                setProfile(profileData);
            } catch (err) {
                console.error("Error fetching main profile:", err);
            }
        };
        fetchAllData();
    }, []);

    const renderStars = (rating) => {
        if (!rating || isNaN(rating)) return null;
        const filledStars = Math.round(rating);
        const stars = '★'.repeat(filledStars) + '☆'.repeat(5 - filledStars);
        return stars;
    };

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
                        {profile?.name?.charAt(0).toUpperCase() || 'D'}
                    </div>

                    <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '10px', fontSize: '1.4rem' }}>
                        {profile?.name || 'Loading...'}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1rem', color: '#111827', fontWeight: 'bold' }}>
                        {profile?.rating && !isNaN(profile.rating) && (
                            <span style={{ color: '#fbbf24', fontSize: '1.2rem', letterSpacing: '2px' }}>
                                {renderStars(profile.rating)}
                            </span>
                        )}
                        <span style={{ marginLeft: '6px' }}>{profile?.rating ?? 'No Rating Yet'}</span>
                    </div>

                    {/* Details Card */}
                    <div style={{
                        backgroundColor: '#f3f4f6', borderRadius: '15px', padding: '20px 15px',
                        display: 'flex', justifyContent: 'center', width: '100%', marginTop: '50px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px' }}>Phone No.</div>
                            <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.1rem' }}>
                                {profile?.phoneNo || 'Loading...'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Log Out Button */}
                <div style={{ marginTop: 'auto' }}>
                    <button
                        className="btn w-100 shadow-sm btn-safar-primary"
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('driverId');
                            localStorage.removeItem('token');
                            navigate('/');
                        }}
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
