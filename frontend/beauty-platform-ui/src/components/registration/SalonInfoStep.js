import React from 'react';

export default function SalonInfoStep({ formData, handleChange }) {
  return (
    <div>
      <h2 className="card-title">Salon Information</h2>
      <p className="card-subtitle">Tell us about your beauty salon</p>
      <div className="form-group">
        <label className="form-label" htmlFor="salonName">Salon Name</label>
        <input
          type="text"
          id="salonName"
          name="salonName"
          className="form-input"
          value={formData.salonName}
          onChange={handleChange}
          required
          placeholder="Enter your salon name"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="form-input"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+380XXXXXXXXX"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="street">Street Address</label>
        <input
          type="text"
          id="street"
          name="street"
          className="form-input"
          value={formData.street}
          onChange={handleChange}
          required
          placeholder="Enter street address"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="city">City</label>
        <input
          type="text"
          id="city"
          name="city"
          className="form-input"
          value={formData.city}
          onChange={handleChange}
          required
          placeholder="Enter city"
        />
      </div>
    </div>
  );
}