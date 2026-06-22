import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { bookingApi } from '../api/booking.api';
import Icon from '../../../components/dashboard/Icon';
import CodeInput from './CodeInput';

const accent = '#D57A66';
const peach = '#FFD1B3';

function useCountdown(expiresAt) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  return { secondsLeft, label: `${mm}:${ss}` };
}


export default function StepVerify({ bookingId, expiresAt, onSuccess, onExpired }) {
  const [code, setCode] = useState('');
  const [serverError, setServerError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const { secondsLeft, label: timerLabel } = useCountdown(expiresAt);
  const timerStarted = React.useRef(false);

  useEffect(() => {
    if (secondsLeft > 0) timerStarted.current = true;
    if (secondsLeft === 0 && expiresAt && timerStarted.current) {
      onExpired?.();
    }
  }, [secondsLeft, expiresAt, onExpired]);

  const verifyMutation = useMutation({
    mutationFn: () => bookingApi.verifyCode(bookingId, code).then((r) => r.data),
    onSuccess: (data) => {
      if (data.success) {
        onSuccess();
      } else {
        setServerError(data.message ?? 'Невірний код');
        setAttemptsLeft(data.attemptsLeft);
        setCode('');
      }
    },
    onError: (err) => {
      setServerError(err?.response?.data?.message ?? 'Помилка перевірки коду');
    },
  });

  const handleSubmit = () => {
    if (code.length !== 4) return;
    setServerError('');
    verifyMutation.mutate();
  };

  const isExpired = secondsLeft === 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#FFF5F0',
          border: `2px solid ${peach}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <Icon name="phone" size={28} color={accent} />
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
        Підтвердіть номер телефону
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
        Ми надіслали SMS з кодом підтвердження.
        <br />
        Введіть його нижче.
      </div>

      {!isExpired ? (
        <>
          <CodeInput value={code} onChange={setCode} />

          {serverError && (
            <div
              style={{
                fontSize: 13,
                color: '#ef4444',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 16,
                textAlign: 'left',
              }}
            >
              {serverError}
              {attemptsLeft !== null && attemptsLeft > 0 && (
                <span style={{ marginLeft: 6 }}>Залишилось спроб: {attemptsLeft}</span>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={code.length !== 4 || verifyMutation.isPending}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              border: 'none',
              background: code.length === 4 ? 'var(--gradient-primary)' : '#e2e8f0',
              color: code.length === 4 ? '#fff' : '#94a3b8',
              fontSize: 15,
              fontWeight: 600,
              cursor: code.length === 4 && !verifyMutation.isPending ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
              boxShadow: code.length === 4 ? '0 4px 12px rgba(213,122,102,0.3)' : 'none',
            }}
          >
            {verifyMutation.isPending ? 'Перевіряємо…' : 'Підтвердити'}
          </button>

          <div style={{ marginTop: 16, fontSize: 13, color: '#94a3b8' }}>
            Код дійсний ще{' '}
            <span style={{ fontWeight: 700, color: secondsLeft < 60 ? '#ef4444' : accent }}>
              {timerLabel}
            </span>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 14,
              color: '#ef4444',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 20,
            }}
          >
            Час очікування вичерпано. Будь ласка, зробіть запис заново.
          </div>
        </div>
      )}
    </div>
  );
}
