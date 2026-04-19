import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import ScheduleGrid from '../components/dashboard/ScheduleGrid';
import { employeeApi } from '../api/employee.api';

const peach = '#FFD1B3';

export default function Home() {
  const navigate = useNavigate();
  const salonId  = localStorage.getItem('salonId');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employees, setEmployees]               = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Owned here so Home can pass them down to ScheduleGrid as controlled props
  const [viewMode, setViewMode]                 = useState('week');
  const [selectedDate, setSelectedDate]         = useState(new Date());
  const [selectedMasterId, setSelectedMasterId] = useState(null);

  useEffect(() => {
    if (!salonId) { navigate('/login'); return; }

    employeeApi.getAll(salonId)
      .then(res => {
        const list = res.data || [];
        setEmployees(list);
        if (list.length > 0) setSelectedMasterId(list[0].id);
      })
      .catch(err => {
        console.error(err);
        if (err?.response?.status === 401) navigate('/login');
      })
      .finally(() => setLoadingEmployees(false));
  }, [salonId, navigate]);

  // Decode display name from JWT
  const rawToken = localStorage.getItem('token');
  let userName = '';
  try {
    if (rawToken) {
      const payload = JSON.parse(atob(rawToken.split('.')[1]));
      userName = payload.firstName
        ? `${payload.firstName} ${payload.lastName || ''}`.trim()
        : (payload.email || '');
    }
  } catch { /* ignore */ }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>

      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Top bar ── */}
        <header style={{
          height: 56,
          background: '#fff',
          borderBottom: `1px solid ${peach}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
          flexShrink: 0,
          boxShadow: '0 1px 6px rgba(213,122,102,0.07)',
          zIndex: 10,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', flex: 1 }}>
            Розклад
          </span>

          {userName && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px',
              borderRadius: 20,
              background: '#FFF5F0',
              fontSize: 13, color: '#475569',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{userName}</span>
            </div>
          )}
        </header>

        {/* ── Schedule (contains its own toolbar + grid) ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ScheduleGrid
            employees={employees}
            appointments={[]}
            loading={loadingEmployees}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedMasterId={selectedMasterId}
            setSelectedMasterId={setSelectedMasterId}
          />
        </div>
      </div>
    </div>
  );
}
