import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const dummyRequests = [
    { id: 1, riderName: "Ali", distance: "2.5 km", price: "Rs 450", pickup: "Gulberg III", dropoff: "DHA Phase 5" },
    { id: 2, riderName: "Sara", distance: "4.1 km", price: "Rs 620", pickup: "Model Town", dropoff: "Johar Town" },
    { id: 3, riderName: "Ahmad", distance: "1.8 km", price: "Rs 300", pickup: "Cantt", dropoff: "Mall Road" }
];

const AcceptRequest = () => {
    const navigate = useNavigate();

    return (
        <div className="mobile-frame" style={{ backgroundColor: '#ffffff' }}>

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '25px 20px' }}>
                <h4 className="text-center mb-4 fw-bold" style={{ color: '#1f2937', fontSize: '1.25rem', marginTop: '20px' }}>
                    Available Requests
                </h4>

                {/* Scrollable List Container */}
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px', paddingRight: '5px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {dummyRequests.map((req) => (
                            <div key={req.id} style={{
                                backgroundColor: '#f3f4f6', borderRadius: '16px', padding: '16px',
                                display: 'flex', flexDirection: 'column', gap: '12px',
                                border: '1px solid #e5e7eb'
                            }}>

                                {/* Header: Rider & Price */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#cdd3ff',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            fontWeight: 'bold', color: '#111827'
                                        }}>
                                            {req.riderName.charAt(0)}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.05rem' }}>
                                            {req.riderName}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '900', color: '#10b981', fontSize: '1.1rem' }}>
                                        {req.price}
                                    </div>
                                </div>

                                {/* Route & Distance */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                                            {req.pickup}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                                            {req.dropoff}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', backgroundColor: '#e5e7eb', padding: '4px 10px', borderRadius: '12px' }}>
                                        {req.distance}
                                    </div>
                                </div>

                                {/* Accept Button */}
                                <button
                                    className="btn w-100 shadow-sm btn-safar-primary"
                                    onClick={() => navigate('/trip-dashboard', { state: { ride: req } })}
                                    style={{
                                        borderRadius: '25px', padding: '12px', fontWeight: 'bold', color: '#1F2937', marginTop: '4px'
                                    }}
                                >
                                    Accept
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptRequest;
