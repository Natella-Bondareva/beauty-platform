import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/dashboard/Icon';
import { useAuthStore } from '../../features/auth/store/authStore';
import { subscriptionApi } from '../../features/pricing/api/subscription.api';

// ── Basic nav items (free modules) ────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'schedule',       icon: 'calendar', label: 'Розклад',    path: '/dashboard' },
  { id: 'employees',      icon: 'users',    label: 'Персонал',   path: '/employees' },
  { id: 'booking-fields', icon: 'list',     label: 'Поля форми', path: '/booking-fields' },
  { id: 'salary',         icon: 'dollar',   label: 'Зарплата',   path: '/salary' },
  { id: 'subscription',   icon: 'settings', label: 'Підписка',   path: '/subscription' },
];

// ── Paid module metadata (ModuleType enum values from backend) ─────────────
// id matches ModuleType enum: Analytics=2, Notifications=3, PRRO=4
const PAID_MODULES = [
  { id: 2, name: 'Analytics',     label: 'Аналітика',   icon: 'chart',  path: '/analytics', price: 99  },
  { id: 3, name: 'Notifications', label: 'Сповіщення',  icon: 'bell',   path: null,         price: 79  },
  { id: 4, name: 'PRRO',          label: 'ПРРО',        icon: 'dollar', path: null,         price: 149 },
];

const EXPANDED  = 240;
const COLLAPSED = 64;
const accent = '#D57A66';
const peach  = '#FFD1B3';
const bg     = '#FFF5F0';

// ── Simple nav button ─────────────────────────────────────────────────────
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
      onMouseEnter={(e) => { if (!active && !disabled) e.currentTarget.style.background = '#FFF0EB'; }}
      onMouseLeave={(e) => { if (!active && !disabled) e.currentTarget.style.background = 'transparent'; }}
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

// ── Booking widget button ─────────────────────────────────────────────────
function BookingWidgetBtn({ salonId, collapsed }) {
  const [copied, setCopied] = useState(false);
  const widgetUrl = `${window.location.origin}/book/${salonId}`;

  const handleOpen  = () => window.open(widgetUrl, '_blank', 'noopener,noreferrer');
  const handleCopy  = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(widgetUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={handleOpen}
        title={collapsed ? 'Форма запису для клієнтів' : undefined}
        style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: '10px 12px', borderRadius: 10, border: 'none', flex: 1,
          cursor: 'pointer', background: 'transparent', color: '#475569',
          fontSize: 14, fontWeight: 400, transition: 'all 0.18s ease', textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF0EB')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Icon name="link" size={18} color="#64748b" />
        {!collapsed && (
          <>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              Форма запису
            </span>
            <Icon name="externalLink" size={14} color="#94a3b8" />
          </>
        )}
      </button>
      {!collapsed && (
        <button
          onClick={handleCopy}
          title="Скопіювати посилання"
          style={{
            width: 30, height: 30, border: 'none', borderRadius: 8,
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF0EB')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name={copied ? 'checkCircle' : 'copy'} size={15} color={copied ? '#22c55e' : '#94a3b8'} />
        </button>
      )}
    </div>
  );
}

// ── Paid module row ────────────────────────────────────────────────────────
function PaidModuleBtn({ mod, active, collapsed, onNavigate, onActivate, activating }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef(null);
  const btnRef    = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          btnRef.current  && !btnRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleActivate = async () => {
    setMenuOpen(false);
    await onActivate(mod.id);
  };

  if (active) {
    return (
      <NavBtn
        icon={mod.icon}
        label={mod.label}
        active={onNavigate.currentPath === mod.path}
        collapsed={collapsed}
        onClick={() => mod.path && onNavigate.go(mod.path)}
        disabled={!mod.path}
      />
    );
  }

  // Locked module
  return (
    <div style={{ position: 'relative' }}>
      <div
        title={collapsed ? `${mod.label} — платний модуль` : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: '10px 12px',
          borderRadius: 10,
          color: '#94a3b8',
          fontSize: 14,
          userSelect: 'none',
        }}
      >
        {/* Module icon */}
        <Icon name={mod.icon} size={18} color="#cbd5e1" />

        {!collapsed && (
          <>
            {/* Label */}
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8' }}>
              {mod.label}
            </span>

            {/* Lock badge */}
            <Icon name="lock" size={13} color="#cbd5e1" />

            {/* Three-dots button */}
            <button
              ref={btnRef}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
              title="Підключити модуль"
              style={{
                width: 24, height: 24, border: 'none', borderRadius: 6,
                background: menuOpen ? '#FFF0EB' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, marginLeft: 2,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF0EB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = menuOpen ? '#FFF0EB' : 'transparent')}
            >
              <Icon name="moreVertical" size={14} color="#94a3b8" />
            </button>
          </>
        )}
      </div>

      {/* Dropdown menu */}
      {menuOpen && !collapsed && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            left: 8, right: 8,
            top: '100%',
            zIndex: 200,
            background: '#fff',
            border: `1px solid ${peach}`,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(213,122,102,0.15)',
            padding: '12px 14px',
            marginTop: 4,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
            {mod.label}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
            {mod.price} грн / місяць
          </div>
          <button
            onClick={() => { setMenuOpen(false); onNavigate.go('/subscription'); }}
            style={{
              width: '100%', padding: '7px', borderRadius: 8, border: 'none',
              background: 'var(--gradient-primary)', color: '#fff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Підключити →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ───────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle }) {
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const clearAuth  = useAuthStore((s) => s.clearAuth);
  const salonId    = useAuthStore((s) => s.salonId);

  const [activeModules, setActiveModules] = useState([]);
  const [activating, setActivating]       = useState(false);

  // Load subscription to know which modules are active
  useEffect(() => {
    if (!salonId) return;
    subscriptionApi.get(salonId)
      .then((res) => setActiveModules(res.data.activeModules ?? []))
      .catch(() => {});
  }, [salonId]);

  const handleActivate = useCallback(async (moduleId) => {
    setActivating(true);
    try {
      await subscriptionApi.addModule(salonId, moduleId, 1);
      // Refresh active modules
      const res = await subscriptionApi.get(salonId);
      setActiveModules(res.data.activeModules ?? []);
    } catch {
      /* TODO: show error toast */
    } finally {
      setActivating(false);
    }
  }, [salonId]);

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const nav = { go: navigate, currentPath: pathname };

  const sectionLabel = (text) =>
    !collapsed && (
      <span style={{
        display: 'block', fontSize: 10, fontWeight: 700, color: accent,
        textTransform: 'uppercase', letterSpacing: '0.8px',
        padding: '0 12px', margin: '12px 0 4px',
      }}>
        {text}
      </span>
    );

  const divider = <div style={{ height: 1, background: peach, margin: '8px 12px' }} />;

  return (
    <aside style={{
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
    }}>

      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0 14px' : '0 12px 0 16px',
        borderBottom: `1px solid ${peach}`, flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.5px',
            }}>BP</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap' }}>
                Beauty Platform
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>CRM для салону</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            width: 32, height: 32, border: 'none', background: 'transparent',
            cursor: 'pointer', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', flexShrink: 0, transition: 'background 0.15s',
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
        {sectionLabel('Клієнти')}
        {salonId && <BookingWidgetBtn salonId={salonId} collapsed={collapsed} />}

        {divider}
        {sectionLabel('Модулі')}
        {PAID_MODULES.map((mod) => (
          <PaidModuleBtn
            key={mod.id}
            mod={mod}
            active={activeModules.includes(mod.name)}
            collapsed={collapsed}
            onNavigate={nav}
            onActivate={handleActivate}
            activating={activating}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px 8px 12px', borderTop: `1px solid ${peach}`, flexShrink: 0 }}>
        <NavBtn
          icon="settings"
          label="Налаштування"
          active={pathname === '/settings'}
          collapsed={collapsed}
          onClick={() => navigate('/settings')}
        />
        <NavBtn icon="logout" label="Вийти" collapsed={collapsed} onClick={handleLogout} />
      </div>
    </aside>
  );
}
