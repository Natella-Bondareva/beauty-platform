import React, { useState, useRef } from 'react';
import { bookingApi } from '../api/booking.api';
import Icon from '../../../components/dashboard/Icon';
import CodeInput from './CodeInput';

const accent = '#D57A66';
const peach = '#FFD1B3';

// ── Status helpers ────────────────────────────────────────────────────────
const STATUS_MAP = {
  0: { label: 'Очікує',       color: '#f97316', bg: '#fff7ed' },
  1: { label: 'Підтверджено', color: '#22c55e', bg: '#f0fdf4' },
  2: { label: 'Завершено',    color: '#3b82f6', bg: '#eff6ff' },
  3: { label: 'Скасовано',    color: '#94a3b8', bg: '#f8fafc' },
  4: { label: 'Неявка',       color: '#f59e0b', bg: '#fffbeb' },
  5: { label: 'Протерм.',     color: '#94a3b8', bg: '#f8fafc' },
};

function statusInfo(s) {
  return STATUS_MAP[s] ?? { label: String(s), color: '#94a3b8', bg: '#f8fafc' };
}

function canCancel(status) { return status === 1; }  // Confirmed only
function canRepeat(status) { return [2, 3, 4, 5].includes(status); } // past

// ── Single booking row ────────────────────────────────────────────────────
function BookingRow({ booking, phone, code, onCancelled, onRepeat }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [err, setErr] = useState('');

  const { label, color, bg } = statusInfo(booking.status);
  const start = new Date(booking.startTimeUtc);
  const dateStr = start.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = start.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  const handleCancel = async () => {
    setCancelling(true);
    setErr('');
    try {
      await bookingApi.cancelByClient(booking.id, phone, code);
      setCancelled(true);
      onCancelled(booking.id);
    } catch (e) {
      setErr(e?.response?.data?.message ?? 'Не вдалося скасувати');
    } finally {
      setCancelling(false);
    }
  };

  if (cancelled) return null;

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid #f1f5f9`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Top row: service + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', flex: 1 }}>
          {booking.serviceName}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 9px',
            borderRadius: 20,
            background: bg,
            color,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {label}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#64748b' }}>
        <span>📅 {dateStr} о {timeStr}</span>
        <span>✂️ {booking.employeeName}</span>
        <span style={{ fontWeight: 600, color: accent }}>
          {(booking.price ?? 0).toLocaleString('uk-UA')} грн
        </span>
      </div>

      {err && (
        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{err}</div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {canCancel(booking.status) && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#ef4444',
              fontSize: 12,
              fontWeight: 600,
              cursor: cancelling ? 'not-allowed' : 'pointer',
              opacity: cancelling ? 0.6 : 1,
            }}
          >
            {cancelling ? 'Скасовую…' : 'Скасувати'}
          </button>
        )}
        {canRepeat(booking.status) && (
          <button
            onClick={() => onRepeat()}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: `1px solid ${peach}`,
              background: '#FFF5F0',
              color: accent,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Повторити
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────
export default function ClientHistoryModal({ salonId, onClose, onRepeat }) {
  const [phase, setPhase] = useState('phone'); // 'phone' | 'code' | 'history'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Store verified creds to reuse for cancel
  const verifiedPhone = useRef('');
  const verifiedCode = useRef('');

  const handleSendCode = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      await bookingApi.requestClientCode(salonId, phone.trim());
      setPhase('code');
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Не вдалося надіслати код');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 4) return;
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.getClientHistory(salonId, phone.trim(), code);
      verifiedPhone.current = phone.trim();
      verifiedCode.current = code;
      setHistory(res.data);
      setPhase('history');
    } catch (e) {
      const msg = e?.response?.data?.message ?? e?.response?.data ?? '';
      setError(typeof msg === 'string' && msg ? msg : 'Невірний код або помилка сервера');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelled = (bookingId) => {
    setHistory((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 3 } : b
      )
    );
  };

  const handleRepeat = () => {
    onClose();
    onRepeat?.();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 480,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: `1px solid ${peach}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Мої записи</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {phase === 'phone' && 'Введіть номер телефону для перевірки'}
              {phase === 'code'  && 'Введіть код з SMS'}
              {phase === 'history' && `Записи для ${verifiedPhone.current}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: '#f8fafc', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="x" size={16} color="#64748b" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* ── Phase: phone ── */}
          {phase === 'phone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#FFF5F0', border: `2px solid ${peach}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 4px',
                }}
              >
                <Icon name="phone" size={24} color={accent} />
              </div>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: 0 }}>
                Введіть номер телефону, яким ви реєструвались при записі.
                Ми надішлемо SMS-код для підтвердження.
              </p>
              <input
                type="tel"
                placeholder="+38 (050) 000-00-00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendCode(); }}
                autoFocus
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${peach}`,
                  fontSize: 15,
                  outline: 'none',
                  color: '#1e293b',
                  textAlign: 'center',
                  letterSpacing: '0.5px',
                }}
              />
              {error && (
                <div style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{error}</div>
              )}
              <button
                onClick={handleSendCode}
                disabled={!phone.trim() || loading}
                style={{
                  padding: '13px',
                  borderRadius: 12,
                  border: 'none',
                  background: phone.trim() && !loading ? 'var(--gradient-primary)' : '#e2e8f0',
                  color: phone.trim() && !loading ? '#fff' : '#94a3b8',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: phone.trim() && !loading ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? 'Надсилаємо…' : 'Надіслати код'}
              </button>
            </div>
          )}

          {/* ── Phase: code ── */}
          {phase === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#FFF5F0', border: `2px solid ${peach}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 4px',
                }}
              >
                <span style={{ fontSize: 22 }}>💬</span>
              </div>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: 0 }}>
                Код надіслано на <strong>{phone}</strong>.<br />
                Введіть 4-значний код нижче.
              </p>
              <CodeInput value={code} onChange={setCode} autoFocus margin="20px 0" />
              {error && (
                <div
                  style={{
                    fontSize: 13, color: '#ef4444', textAlign: 'center',
                    background: '#fef2f2', borderRadius: 8, padding: '8px 12px',
                  }}
                >
                  {error}
                </div>
              )}
              <button
                onClick={handleVerify}
                disabled={code.length !== 4 || loading}
                style={{
                  padding: '13px',
                  borderRadius: 12,
                  border: 'none',
                  background: code.length === 4 && !loading ? 'var(--gradient-primary)' : '#e2e8f0',
                  color: code.length === 4 && !loading ? '#fff' : '#94a3b8',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: code.length === 4 && !loading ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? 'Перевіряємо…' : 'Переглянути записи'}
              </button>
              <button
                onClick={() => { setPhase('phone'); setCode(''); setError(''); }}
                style={{
                  padding: '8px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ← Змінити номер
              </button>
            </div>
          )}

          {/* ── Phase: history ── */}
          {phase === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  Жодних записів не знайдено
                </div>
              ) : (
                history.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    phone={verifiedPhone.current}
                    code={verifiedCode.current}
                    onCancelled={handleCancelled}
                    onRepeat={handleRepeat}
                  />
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
