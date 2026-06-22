import React from 'react';

export default function SalonInfoStep({ formData, handleChange }) {
  return (
    <div>
      <h2 className="card-title">Інформація про салон</h2>
      <p className="card-subtitle">Розкажіть про ваш салон краси</p>
      <div className="form-group">
        <label className="form-label" htmlFor="salonName">Назва салону</label>
        <input
          type="text"
          id="salonName"
          name="salonName"
          className="form-input"
          value={formData.salonName}
          onChange={handleChange}
          required
          placeholder="Введіть назву салону"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="phone">Номер телефону</label>
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
        <label className="form-label" htmlFor="street">Вулиця</label>
        <input
          type="text"
          id="street"
          name="street"
          className="form-input"
          value={formData.street}
          onChange={handleChange}
          required
          placeholder="Введіть адресу"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="city">Місто</label>
        <input
          type="text"
          id="city"
          name="city"
          className="form-input"
          value={formData.city}
          onChange={handleChange}
          required
          placeholder="Введіть місто"
        />
      </div>
    </div>
  );
}
