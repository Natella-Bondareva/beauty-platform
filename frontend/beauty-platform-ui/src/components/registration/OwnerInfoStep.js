import React from 'react';

export default function OwnerInfoStep({ formData, handleChange }) {
  return (
    <div>
      <h2 className="card-title">Owner Information</h2>
      <p className="card-subtitle">Tell us about yourself</p>
      <div className="form-group">
        <label className="form-label" htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          className="form-input"
          value={formData.firstName}
          onChange={handleChange}
          required
          placeholder="Enter your first name"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          className="form-input"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Enter your last name"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-input"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Create a password"
        />
      </div>
    </div>
  );
}