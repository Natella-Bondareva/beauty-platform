import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/dashboard/Icon';
import { useAuthStore } from '../../features/auth/store/authStore';

const NAV_ITEMS = [
  { id: 'schedule', icon: 'calendar', label: 'Розклад', path: '/dashboard' },
  { id: 'employees', icon: 'users', label: 'Майстри', path: '/employees' },
  { id: 'services', icon: 'scissors', label: 'Послуги', path: '/services' },
];

const COMING_SOON = [
  { id: 'statistics', icon: 'chart', label: 'Статистика' },
  { id: 'salary', icon: 'dollar', label: 'Зарплата' },
];

const EXPANDED = 240;
const COLLAPSED = 64;
const accent = '#D57A66';
const peach = '#FFD1B3';
const bg = '#FFF5F0';

function NavBtn({ icon, label, active, collapsed, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: '10px 12px',
        borderRadius: 10,
        border: 'none',
        width: '100%',
        cursor: disabled ? 'default' : 'pointer',
        background: active ? 'var(--gradient-primary)' : 'transparent',
        color: active ? '#fff' : disabled ? '#cbd5e1' : '#475569',
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        boxShadow: active ? '0 4px 12px rgba(213,122,102,0.25)' : 'none',
        transition: 'all 0.18s ease',
        textAlign: 'left',
        opacity: disabled ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) e.currentTarget.style.background = '#FFF0EB';
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled) e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon name={icon} size={18} color={active ? '#fff' : disabled ? '#cbd5e1' : '#64748b'} />
      {!collapsed && (
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const sectionLabel = (text) =>
    !collapsed && (
      <span
        style={{
          display: 'block',
          fontSize: 10,
          fontWeight: 700,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          padding: '0 12px',
          margin: '12px 0 4px',
        }}
      >
        {text}
      </span>
    );

  const divider = <div style={{ height: 1, background: peach, margin: '8px 12px' }} />;

  return (
    <aside
      style={{
        width: collapsed ? COLLAPSED : EXPANDED,
        minHeight: '100vh',
        background: '#fff',
        borderRight: `1px solid ${peach}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '2px 0 16px rgba(213,122,102,0.07)',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 14px' : '0 12px 0 16px',
          borderBottom: `1px solid ${peach}`,
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '-0.5px',
              }}
            >
              BP
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap' }}>
                Beauty Platform
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                CRM для салону
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = bg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name="menu" size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {sectionLabel('Головне')}
        {NAV_ITEMS.map((item) => (
          <NavBtn
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={pathname === item.path}
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}

        {divider}
        {sectionLabel('Незабаром')}

        {COMING_SOON.map((item) => (
          <div
            key={item.id}
            title={collapsed ? item.label : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: '10px 12px',
              borderRadius: 10,
              color: '#94a3b8',
            }}
          >
            <Icon name={item.icon} size={18} color="#94a3b8" />
            {!collapsed && (
              <>
                <span style={{ flex: 1, fontSize: 14, color: '#94a3b8' }}>{item.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 20,
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Скоро
                </span>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px 8px 12px', borderTop: `1px solid ${peach}`, flexShrink: 0 }}>
        <NavBtn icon="settings" label="Налаштування" collapsed={collapsed} onClick={() => {}} />
        <NavBtn icon="logout" label="Вийти" collapsed={collapsed} onClick={handleLogout} />
      </div>
    </aside>
  );
}
