import React, { useState } from 'react';
import { Avatar } from '../../../../shared/ui/Avatar';
import { TabBtn } from '../../../../shared/ui/TabBtn';
import { peach } from '../../../../shared/ui/tokens';
import InfoTab from './InfoTab';
import ServicesTab from './ServicesTab';
import ScheduleTab from './ScheduleTab';

export default function EmployeePanel({ emp, salonCategories, allSalonServices, onClose }) {
  const [tab, setTab] = useState('info');

  return (
    <>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', borderBottom: `1px solid ${peach}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Avatar name={emp.fullName} avatarUrl={emp.avatarUrl} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {emp.fullName}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: emp.isActive ? '#22c55e' : '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
              <span>{emp.isActive ? 'Активний' : 'Неактивний'}</span>
              <span>· {emp.servicesCount ?? 0} послуг</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: `1px solid ${peach}`, borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: -1 }}>
          <TabBtn label="Загальне"  active={tab === 'info'}     onClick={() => setTab('info')} />
          <TabBtn label="Послуги"   active={tab === 'services'} onClick={() => setTab('services')} />
          <TabBtn label="Розклад"   active={tab === 'schedule'} onClick={() => setTab('schedule')} />
        </div>
      </div>

      {/* Tab content — each tab manages its own scroll */}
      {tab === 'info' && (
        <InfoTab emp={emp} salonCategories={salonCategories} onClose={onClose} />
      )}
      {tab === 'services' && (
        <ServicesTab empId={emp.id} allSalonServices={allSalonServices} />
      )}
      {tab === 'schedule' && (
        <ScheduleTab empId={emp.id} enabled={tab === 'schedule'} />
      )}
    </>
  );
}
