import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Code splitting — кожна сторінка завантажується тільки при навігації на неї
const HomePage      = lazy(() => import('../pages/HomePage'));
const LoginPage     = lazy(() => import('../pages/LoginPage'));
const RegisterPage  = lazy(() => import('../pages/Register'));
const EmployeesPage = lazy(() => import('../pages/EmployeesPage'));

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
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
