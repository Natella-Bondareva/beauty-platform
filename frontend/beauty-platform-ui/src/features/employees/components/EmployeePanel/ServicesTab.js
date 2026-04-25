import React, { useState } from 'react';
import { accent, peach, inputStyle } from '../../../../shared/ui/tokens';
import { useEmployeeDetail } from '../../hooks/useEmployees';
import { useEmployeeServices } from '../../hooks/useEmployeeServices';
import Icon from '../../../../components/dashboard/Icon';

const fmt = (m) => `${m} хв`;

export default function ServicesTab({ empId, allSalonServices }) {
  const { data: detail, isLoading } = useEmployeeDetail(empId);
  const { assignMutation, removeMutation, updatePriceMutation } = useEmployeeServices(empId);

  const [priceEditId, setPriceEditId] = useState(null);
  const [priceValue, setPriceValue] = useState('');
  const [showAssign, setShowAssign] = useState(false);

  const assignedServices = detail?.services ?? [];
  const assignedIds = new Set(assignedServices.map((s) => s.serviceId));
  const unassigned = (allSalonServices ?? []).filter((s) => !assignedIds.has(s.id));

  const grouped = assignedServices.reduce((acc, svc) => {
    const cat = svc.categoryName ?? 'Без категорії';
    (acc[cat] ??= []).push(svc);
    return acc;
  }, {});

  const opLoading =
    assignMutation.isPending || removeMutation.isPending || updatePriceMutation.isPending;

  const handlePriceSave = async () => {
    const val = priceValue === '' ? null : parseFloat(priceValue);
    await updatePriceMutation.mutateAsync({ serviceId: priceEditId, priceOverride: val });
    setPriceEditId(null);
  };

  if (isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Завантаження...
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Призначені послуги ({assignedServices.length})
        </span>
        <button onClick={() => setShowAssign((v) => !v)} style={{ fontSize: 12, fontWeight: 600, color: accent, background: '#FFF5F0', border: `1px solid ${peach}`, borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}>
          {showAssign ? 'Сховати' : '+ Призначити'}
        </button>
      </div>

      {assignedServices.length === 0 && !showAssign && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
          <Icon name="scissors" size={32} color="#FFD1B3" />
          <p style={{ margin: '10px 0 4px', fontSize: 14, color: '#64748b' }}>Послуг ще не призначено</p>
          <button onClick={() => setShowAssign(true)} style={{ marginTop: 8, padding: '7px 18px', borderRadius: 8, border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Призначити послугу
          </button>
        </div>
      )}

      {Object.entries(grouped).map(([catName, svcs]) => (
        <div key={catName} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7, paddingBottom: 5, borderBottom: '1px solid #f1f5f9' }}>
            {catName}
          </div>
          {svcs.map((svc) => (
            <div key={svc.serviceId}>
              {priceEditId === svc.serviceId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FFF5F0', border: `1px solid ${peach}`, borderRadius: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B', marginBottom: 6 }}>{svc.serviceName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Індивідуальна ціна (грн)</span>
                      <input style={{ ...inputStyle, width: 110, padding: '5px 8px' }} type="number" min={0} value={priceValue} onChange={(e) => setPriceValue(e.target.value)} placeholder="стандартна" />
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Базова: {svc.basePrice} грн · Якщо порожньо — застосується базова</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button onClick={handlePriceSave} disabled={opLoading} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{opLoading ? '...' : 'ОК'}</button>
                    <button onClick={() => setPriceEditId(null)} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${peach}`, background: 'transparent', cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff', border: `1px solid ${peach}`, borderRadius: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{svc.serviceName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span>⏱ {fmt(svc.effectiveSystemDuration)}</span>
                      <span>👤 {fmt(svc.effectiveClientDuration)}</span>
                      <span style={{ color: svc.priceOverride != null ? '#a78bfa' : accent, fontWeight: 600 }}>
                        {svc.effectivePrice} грн{svc.priceOverride != null && <span title="Індивідуальна ціна"> *</span>}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => { setPriceEditId(svc.serviceId); setPriceValue(svc.priceOverride != null ? String(svc.priceOverride) : ''); }} title="Встановити індивідуальну ціну" style={{ width: 28, height: 28, border: `1px solid ${peach}`, borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF5F0'; e.currentTarget.style.color = accent; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                  >₴</button>
                  <button onClick={() => removeMutation.mutate(svc.serviceId)} disabled={opLoading} title="Прибрати послугу" style={{ width: 28, height: 28, border: '1px solid #fca5a5', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {showAssign && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Послуги салону · не призначені ({unassigned.length})
          </div>
          {unassigned.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>Всі послуги салону вже призначені цьому майстру</p>
          ) : (
            unassigned.map((svc) => (
              <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: '#fff', border: `1.5px dashed ${peach}`, borderRadius: 10, marginBottom: 6 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{svc.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {svc.category && <span style={{ padding: '1px 6px', borderRadius: 6, background: '#f1f5f9', color: '#64748b' }}>{svc.category}</span>}
                    <span>{svc.clientDurationMinutes} хв · {svc.price} грн</span>
                  </div>
                </div>
                <button onClick={() => assignMutation.mutate({ serviceId: svc.id })} disabled={opLoading} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${peach}`, background: '#FFF5F0', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: accent, flexShrink: 0, marginLeft: 8 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = accent; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF5F0'; e.currentTarget.style.color = accent; }}
                >+ Призначити</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
