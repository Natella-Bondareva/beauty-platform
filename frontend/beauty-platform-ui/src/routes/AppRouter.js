import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Code splitting — кожна сторінка завантажується тільки при навігації на неї
const HomePage      = lazy(() => import('../pages/HomePage'));
const LoginPage     = lazy(() => import('../pages/LoginPage'));
const RegisterPage  = lazy(() => import('../pages/Register'));
const EmployeesPage     = lazy(() => import('../pages/EmployeesPage'));
const SalonSettingsPage = lazy(() => import('../pages/SalonSettingsPage'));
const BookingPage       = lazy(() => import('../pages/BookingPage'));
const MasterPage          = lazy(() => import('../pages/MasterPage'));
const BookingFieldsPage   = lazy(() => import('../pages/BookingFieldsPage'));
const SalaryPage          = lazy(() => import('../pages/SalaryPage'));
const AnalyticsPage       = lazy(() => import('../pages/AnalyticsPage'));
const SubscriptionPage    = lazy(() => import('../pages/SubscriptionPage'));

function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#F8FAFC',
        color: '#94a3b8',
        fontSize: 14,
      }}
    >
      Завантаження...
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/settings"  element={<SalonSettingsPage />} />
          <Route path="/book/:salonId" element={<BookingPage />} />
          <Route path="/master"         element={<MasterPage />} />
          <Route path="/booking-fields" element={<BookingFieldsPage />} />
          <Route path="/salary"         element={<SalaryPage />} />
          <Route path="/analytics"      element={<AnalyticsPage />} />
          <Route path="/subscription"   element={<SubscriptionPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
