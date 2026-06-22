import React, { useEffect } from 'react';
import { useAdminBooking } from '../hooks/useAdminBooking';
import { accent, peach, inputStyle } from '../../../shared/ui/tokens';

const UA_DAYS  = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];
const UA_MONTH = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];

function formatSlotDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${UA_DAYS[d.getDay()]}, ${d.getDate()} ${UA_MONTH[d.getMonth()]}`;
}

function Avatar({ name, size = 28 }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  const hue = [...(name || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},50%,60%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.42, userSelect: 'none',
    }}>{initial}</div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminBookingModal({ slot, bookings, employees, onClose, onSuccess }) {
  const {
    selectedServiceId, setSelectedServiceId,
    clientPhone, handlePhoneChange,
    clientFirstName, setClientFirstName,
    notes, setNotes,
    clientSuggestions,
    selectedClient, pickClient,
    searchLoading,
    employeeServices, servicesLoading,
    selectedEmployee,
    conflict,
    submit, isSubmitting, submitError,
    canSubmit,
  } = useAdminBooking({ slot, bookings, employees, onSuccess: () => { onSuccess?.(); onClose(); } });

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!slot) return null;

  const selectedSvc = employeeServices.find((s) => s.serviceId === selectedServiceId);

  // ── Error message helper ──────────────────────────────────────────────────
  const apiError = (() => {
    if (!submitError) return null;
    const msg = submitError?.response?.data?.title
      || submitError?.response?.data
      || submitError?.message
      || 'Помилка збереження';
    return String(msg);
  })();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 201,
        transform: 'translate(-50%, -50%)',
        width: 440, maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 48px)',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 8px 48px rgba(15,23,42,0.22)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          background: 'linear-gradient(135deg, #FFF5F0, #FFE8DA)',
          borderBottom: `1px solid ${peach}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1E293B' }}>Новий запис</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedEmployee && <Avatar name={selectedEmployee.fullName} size={20} />}
              <span style={{ fontWeight: 600, color: accent }}>
                {selectedEmployee?.fullName ?? '—'}
              </span>
              <span>·</span>
              <span>{formatSlotDate(slot.date)}</span>
              <span>·</span>
              <span style={{ fontWeight: 700, color: '#1E293B' }}>{slot.time}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, border: `1px solid ${peach}`,
              borderRadius: 8, background: 'transparent',
              cursor: 'pointer', fontSize: 18, color: '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* ── Service ─────────────────────────────────────────────────── */}
          <Field label="Послуга">
            {servicesLoading ? (
              <div style={{ fontSize: 13, color: '#94a3b8', padding: '8px 0' }}>Завантаження...</div>
            ) : employeeServices.length === 0 ? (
              <div style={{ fontSize: 13, color: '#ef4444', padding: '8px 0' }}>
                У майстра немає призначених послуг
              </div>
            ) : (
              <select
                value={selectedServiceId}
                onChange={e => setSelectedServiceId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">— Оберіть послугу —</option>
                {employeeServices.map(svc => (
                  <option key={svc.serviceId} value={svc.serviceId}>
                    {svc.serviceName}
                    {' '}· {svc.effectiveClientDuration} хв
                    {' '}· {svc.effectivePrice} ₴
                  </option>
                ))}
              </select>
            )}
          </Field>

          {/* Service summary badge */}
          {selectedSvc && (
            <div style={{
              display: 'flex', gap: 12, marginBottom: 18, marginTop: -8,
              padding: '8px 12px', background: '#f8fafc', borderRadius: 8,
              border: `1px solid #e2e8f0`, fontSize: 12, color: '#64748b',
            }}>
              <span>⏱ {selectedSvc.effectiveClientDuration} хв клієнт</span>
              <span>·</span>
              <span>🔧 {selectedSvc.effectiveSystemDuration} хв зайнятість</span>
              <span>·</span>
              <span style={{ color: accent, fontWeight: 700 }}>{selectedSvc.effectivePrice} ₴</span>
            </div>
          )}

          {/* ── Conflict warning ─────────────────────────────────────────── */}
          {conflict && (
            <div style={{
              marginBottom: 16, padding: '10px 14px',
              background: '#fffbeb', border: '1.5px solid #fbbf24',
              borderRadius: 10, fontSize: 13, color: '#92400e',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠ Можливий конфлікт</div>
              {conflict.map(b => (
                <div key={b.id} style={{ fontSize: 12, opacity: 0.85 }}>
                  {b.clientName || b.clientPhone} — {b.serviceName}
                </div>
              ))}
              <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>
                Запис буде збережено, але зверніть увагу
              </div>
            </div>
          )}

          {/* ── Client phone ─────────────────────────────────────────────── */}
          <Field label="Телефон клієнта">
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="+380..."
                value={clientPhone}
                onChange={e => handlePhoneChange(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: clientPhone && clientPhone.length < 10 ? '#fca5a5' : '#e2e8f0',
                  paddingRight: searchLoading ? 36 : undefined,
                }}
              />
              {searchLoading && (
                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>
                  ⏳
                </div>
              )}

              {/* Suggestions dropdown */}
              {clientSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: '#fff', border: `1px solid ${peach}`,
                  borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  marginTop: 2, overflow: 'hidden',
                }}>
                  {clientSuggestions.map(client => (
                    <button
                      key={client.id}
                      onClick={() => pickClient(client)}
                      style={{
                        width: '100%', padding: '10px 14px', textAlign: 'left',
                        border: 'none', borderBottom: `1px solid #f1f5f9`,
                        background: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F0')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Avatar name={client.fullName || client.phone} size={28} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                          {client.fullName || 'Без імені'}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          {client.phone}
                          {client.noShowCount > 0 && (
                            <span style={{ marginLeft: 8, color: '#ef4444' }}>
                              ⚠ {client.noShowCount} пропущ.
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected client badge */}
            {selectedClient && (
              <div style={{
                marginTop: 6, padding: '7px 12px', background: '#f0fdf4',
                border: '1px solid #86efac', borderRadius: 8,
                fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Avatar name={selectedClient.fullName || selectedClient.phone} size={22} />
                <span>
                  <strong>{selectedClient.fullName || 'Клієнт знайдений'}</strong>
                  {selectedClient.lastVisitAt && (
                    <span style={{ fontWeight: 400, marginLeft: 6, opacity: 0.7 }}>
                      · остан. {new Date(selectedClient.lastVisitAt).toLocaleDateString('uk-UA')}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* New client hint */}
            {!selectedClient && clientPhone.length >= 10 && clientSuggestions.length === 0 && !searchLoading && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                ✨ Новий клієнт буде створений автоматично
              </div>
            )}
          </Field>

          {/* ── Client first name ─────────────────────────────────────────── */}
          <Field label="Ім'я клієнта (необов'язково)">
            <input
              type="text"
              placeholder="Наприклад, Олена"
              value={clientFirstName}
              onChange={e => setClientFirstName(e.target.value)}
              style={inputStyle}
            />
          </Field>

          {/* ── Notes ─────────────────────────────────────────────────────── */}
          <Field label="Примітки (необов'язково)">
            <textarea
              placeholder="Побажання клієнта, нотатки..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 56 }}
            />
          </Field>

          {/* ── API error ─────────────────────────────────────────────────── */}
          {apiError && (
            <div style={{
              padding: '10px 14px', background: '#fef2f2',
              border: '1.5px solid #fca5a5', borderRadius: 10,
              fontSize: 13, color: '#991b1b', marginBottom: 4,
            }}>
              {apiError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: `1px solid ${peach}`,
          background: '#fafafa',
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: `1.5px solid ${peach}`, background: 'transparent',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#64748b',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F0')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >Скасувати</button>

          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 10, border: 'none',
              background: canSubmit ? 'var(--gradient-primary)' : '#e2e8f0',
              color: canSubmit ? '#fff' : '#94a3b8',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 700,
              boxShadow: canSubmit ? '0 2px 10px rgba(213,122,102,0.3)' : 'none',
              transition: 'all 0.18s',
            }}
          >
            {isSubmitting ? 'Зберігаємо...' : '✓ Записати'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: '#475569', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.4px',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
