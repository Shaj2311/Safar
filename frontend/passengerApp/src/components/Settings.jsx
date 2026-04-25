import React, { useState } from 'react';
import { updatePassengerProfile } from '../services/api';

export const Settings = ({ setCurrentScreen }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cnic: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Sirf wahi data bhejo jo user ne bhara ho, taake purana data delete na ho
    const payload = {};
    if (formData.name) payload.name = formData.name;
    if (formData.phone) payload.phone = formData.phone;
    if (formData.cnic) payload.cnic = formData.cnic;

    if (Object.keys(payload).length === 0) {
      setLoading(false);
      alert('Please enter at least one field to update.');
      return;
    }

    try {
      await updatePassengerProfile(payload);
      alert('Profile Settings successfully updated!');
      // Update success hone ke baad form clear kar do ya wapis home pe bhej do
      setCurrentScreen('home');
    } catch (error) {
      console.error(error);
      alert('Failed to update Profile Settings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-100 h-100 bg-white d-flex flex-column" style={{ zIndex: 10 }}>
      {/* Header */}
      <div className="p-4 d-flex align-items-center mt-2">
        <button 
          className="btn btn-link text-dark p-0 me-3" 
          onClick={() => setCurrentScreen('home')}
        >
          <i className="bi bi-arrow-left" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}></i>
        </button>
        <h4 className="mb-0 fw-bold flex-grow-1 text-center" style={{ color: '#2B3445', paddingRight: '2.5rem' }}>Profile Settings</h4>
      </div>

      {/* Form Fields */}
      <form className="px-4 mt-2 flex-grow-1 d-flex flex-column" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label fw-bold mb-1" style={{ color: '#000000', fontSize: '1.1rem' }}>Full Name</label>
          <input 
            type="text" 
            name="name"
            className="form-control form-control-lg border-0 shadow-none" 
            style={{ backgroundColor: '#EBEBEB', borderRadius: '12px', padding: '15px' }}
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold mb-1" style={{ color: '#000000', fontSize: '1.1rem' }}>Phone Number</label>
          <input 
            type="tel" 
            name="phone"
            className="form-control form-control-lg border-0 shadow-none" 
            style={{ backgroundColor: '#EBEBEB', borderRadius: '12px', padding: '15px' }}
            placeholder="+923001234567"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold mb-1" style={{ color: '#000000', fontSize: '1.1rem' }}>CNIC</label>
          <input 
            type="text" 
            name="cnic"
            className="form-control form-control-lg border-0 shadow-none" 
            style={{ backgroundColor: '#EBEBEB', borderRadius: '12px', padding: '15px' }}
            placeholder="35202-1234567-1"
            value={formData.cnic}
            onChange={handleChange}
          />
        </div>

        {/* Save Button at Bottom */}
        <div className="mt-auto mb-5 pb-4">
          <button 
            type="submit" 
            className="btn w-100 rounded-pill py-3 text-white shadow-none"
            style={{ backgroundColor: '#80CCA5', fontSize: '1.1rem', fontWeight: '600' }}
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
