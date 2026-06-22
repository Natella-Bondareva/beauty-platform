import React from 'react';

export default function OwnerInfoStep({ formData, handleChange }) {
  return (
    <div>
      <h2 className="card-title">Інформація про власника</h2>
      <p className="card-subtitle">Розкажіть про себе</p>
      <div className="form-group">
        <label className="form-label" htmlFor="firstName">Ім'я</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          className="form-input"
          value={formData.firstName}
          onChange={handleChange}
          required
          placeholder="Введіть ваше ім'я"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="lastName">Прізвище</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          className="form-input"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Введіть ваше прізвище"
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
          placeholder="Введіть ваш email"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="password">Пароль</label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-input"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Створіть пароль"
        />
      </div>
    </div>
  );
}
