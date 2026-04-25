import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { useAuthStore } from '../../features/auth/store/authStore';

const peach = '#FFD1B3';

export default function DashboardLayout({ title, children, contentStyle }) {
  const [collapsed, setCollapsed] = useState(false);
  const userName = useAuthStore((s) => s.userName);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header
          style={{
            height: 56,
            flexShrink: 0,
            background: '#fff',
            borderBottom: `1px solid ${peach}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 12,
            boxShadow: '0 1px 6px rgba(213,122,102,0.07)',
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', flex: 1 }}>{title}</span>

          {userName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 20,
                background: '#FFF5F0',
                fontSize: 13,
                color: '#475569',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{userName}</span>
            </div>
          )}
        </header>

        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', ...contentStyle }}>{children}</div>
      </div>
    </div>
  );
}
