import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../widgets/DashboardLayout';
import { useSalonId } from '../shared/hooks/useSalonId';
import { subscriptionApi, CONTRACT_TYPE_LABELS } from '../features/pricing/api/subscription.api';

const accent = '#D57A66';
const peach  = '#FFD1B3';
const bg     = '#FFF5F0';
const gray   = '#94a3b8';
const dark   = '#1E293B';

// ─── Утиліти ─────────────────────────────────────────────────────────────────

function fmtMoney(n) {
  return n != null ? `${Number(n).toLocaleString('uk-UA')} ₴` : '—';
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const MODULE_META = {
  Salary:          { label: 'Зарплата',        icon: '💰', free: true  },
  OnlineBooking:   { label: 'Онлайн-запис',    icon: '📅', free: true  },
  Analytics:       { label: 'Аналітика',        icon: '📊', free: false },
  Notifications:   { label: 'Сповіщення',       icon: '🔔', free: false },
  PRRO:            { label: 'ПРРО',             icon: '🖨️', free: false },
};

const MODULE_ID = { Analytics: 2, Notifications: 3, PRRO: 4 };

const MONTHS_OPTIONS = [
  { value: 1,  label: '1 міс',    discount: null  },
  { value: 3,  label: '3 міс',    discount: null  },
  { value: 6,  label: '6 міс',    discount: '−5%' },
  { value: 12, label: '12 міс',   discount: '−10%' },
];

const PAYMENT_STATUS_LABEL = { Pending: 'Очікує', Completed: 'Виконано', Failed: 'Помилка' };

// ─── Дрібні компоненти ────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>
      {children}
    </h3>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending:   { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
    Completed: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Failed:    { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' },
  };
  const s = styles[status] ?? styles.Pending;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {PAYMENT_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10, marginBottom: 12,
      background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#ef4444',
    }}>{msg}</div>
  );
}

// ─── КАРТКА ПОТОЧНОЇ ПІДПИСКИ ─────────────────────────────────────────────────

function SubscriptionCard({ subscription }) {
  if (!subscription) return null;

  return (
    <div style={{
      background: 'var(--gradient-primary)', borderRadius: 18,
      padding: '24px 28px', color: '#fff', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: 20,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>Поточний план</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>
          {subscription.monthlyPrice === 0 ? 'Безкоштовний' : fmtMoney(subscription.monthlyPrice)}
          {subscription.monthlyPrice > 0 && (
            <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8, marginLeft: 6 }}>/ міс</span>
          )}
        </div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
          Доступно майстрів: {subscription.masterLimit}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(subscription.activeModules ?? []).map((m) => (
          <span key={m} style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: 8,
            padding: '5px 12px', fontSize: 12, fontWeight: 600,
          }}>
            {MODULE_META[m]?.icon ?? '•'} {MODULE_META[m]?.label ?? m}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── КАРТКИ МОДУЛІВ ───────────────────────────────────────────────────────────

function ModuleCard({ name, subscription, onActivate }) {
  const meta    = MODULE_META[name] ?? { label: name, icon: '🔧', free: false };
  const isFree  = meta.free;
  const active  = subscription?.activeModules?.includes(name) ?? false;
  const modData = subscription?.modules?.find((m) => m.module === name);

  return (
    <div style={{
      background: '#fff', border: `1.5px solid ${active ? '#bbf7d0' : peach}`,
      borderRadius: 14, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      opacity: !active && !isFree ? 0.9 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: dark }}>{meta.label}</div>
          {isFree && (
            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Включено безкоштовно</div>
          )}
          {!isFree && !active && (
            <div style={{ fontSize: 11, color: gray }}>
              {fmtMoney(getPaidModulePrice(name))} / міс
            </div>
          )}
          {!isFree && active && modData?.expiresAt && (
            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 500 }}>
              Активний до {fmtDate(modData.expiresAt)}
            </div>
          )}
        </div>
        {active ? (
          <span style={{
            background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
          }}>
            ✓ Активний
          </span>
        ) : isFree ? (
          <span style={{
            background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
          }}>
            ✓ Активний
          </span>
        ) : (
          <span style={{
            background: '#f1f5f9', color: gray, border: '1px solid #e2e8f0',
            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
          }}>
            🔒 Не активний
          </span>
        )}
      </div>

      {!isFree && !active && (
        <button
          onClick={() => onActivate(name)}
          style={{
            width: '100%', padding: '9px', borderRadius: 10, border: 'none',
            background: 'var(--gradient-primary)', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Підключити
        </button>
      )}
    </div>
  );
}

function getPaidModulePrice(name) {
  const prices = { Analytics: 99, Notifications: 79, PRRO: 149 };
  return prices[name] ?? 0;
}

// ─── МОДАЛЬНЕ ВІКНО ОПЛАТИ ───────────────────────────────────────────────────

function PaymentModal({ open, moduleName, onClose, onSuccess, salonId }) {
  const [months, setMonths]     = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [paid, setPaid]         = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) { setMonths(1); setError(''); setPaid(false); }
  }, [open]);

  if (!open) return null;

  const meta      = MODULE_META[moduleName] ?? { label: moduleName, icon: '🔧' };
  const basePrice = getPaidModulePrice(moduleName);
  const discount  = months >= 12 ? 0.10 : months >= 6 ? 0.05 : 0;
  const total     = Math.round(basePrice * months * (1 - discount));

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      await subscriptionApi.pay(salonId, 'Module', MODULE_ID[moduleName], null, months);
      setPaid(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || 'Помилка оплати');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 420, maxWidth: '95vw',
        background: '#fff', borderRadius: 20, border: `1px solid ${peach}`,
        boxShadow: '0 12px 48px rgba(213,122,102,0.18)', padding: '28px 28px 24px',
      }}>
        {paid ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: dark }}>Оплата успішна!</div>
            <div style={{ fontSize: 13, color: gray, marginTop: 6 }}>
              {meta.label} підключено
            </div>
          </div>
        ) : (
          <>
            {/* Заголовок */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: dark }}>
                  {meta.icon} {meta.label}
                </div>
                <div style={{ fontSize: 13, color: gray, marginTop: 3 }}>
                  {fmtMoney(basePrice)} / місяць
                </div>
              </div>
              <button onClick={onClose} style={{
                width: 32, height: 32, border: `1px solid ${peach}`,
                borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, color: gray,
              }}>✕</button>
            </div>

            {/* Вибір терміну */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
                Термін підключення
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {MONTHS_OPTIONS.map(({ value, label, discount: disc }) => (
                  <button
                    key={value}
                    onClick={() => setMonths(value)}
                    style={{
                      flex: 1, padding: '9px 4px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${months === value ? accent : peach}`,
                      background: months === value ? bg : '#fff',
                      color: months === value ? accent : '#475569',
                      fontSize: 12, fontWeight: months === value ? 700 : 400,
                      position: 'relative', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 2,
                    }}
                  >
                    {label}
                    {disc && (
                      <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>{disc}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Фейкова картка — явно позначена як тестова */}
            <div style={{
              background: bg, border: `1px solid ${peach}`,
              borderRadius: 12, padding: '16px 18px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Платіжні дані
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#f59e0b',
                  background: '#fefce8', border: '1px solid #fde68a',
                  borderRadius: 6, padding: '2px 8px',
                }}>
                  ТЕСТОВА ОПЛАТА
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={labelSt}>Номер картки</div>
                  <input
                    readOnly
                    value="4242 4242 4242 4242"
                    style={{ ...inputSt, letterSpacing: '2px', fontFamily: 'monospace', color: '#64748b' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={labelSt}>Термін дії</div>
                    <input readOnly value="12/26" style={{ ...inputSt, color: '#64748b' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={labelSt}>CVV</div>
                    <input readOnly value="123" style={{ ...inputSt, color: '#64748b' }} />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
                ℹ️ Реальну оплату через Monobank / LiqPay можна підключити пізніше
              </div>
            </div>

            {error && <ErrorBanner msg={error} />}

            {/* Підсумок + кнопка */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: 12, background: bg,
              border: `1px solid ${peach}`, marginBottom: 14,
            }}>
              <div>
                <div style={{ fontSize: 12, color: gray }}>
                  {fmtMoney(basePrice)} × {months} міс{discount > 0 ? ` (−${discount * 100}%)` : ''}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: accent }}>{fmtMoney(total)}</div>
              </div>
              <div style={{ fontSize: 11, color: gray, textAlign: 'right' }}>
                Після оплати модуль<br />активується одразу
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: loading ? '#e2e8f0' : 'var(--gradient-primary)',
                color: loading ? gray : '#fff',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Обробка...' : `Оплатити ${fmtMoney(total)}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── МОДАЛЬНЕ ВІКНО: КУПИТИ СЛОТИ МАЙСТРІВ ───────────────────────────────────

function MasterSlotsModal({ open, onClose, onSuccess, salonId, currentLimit }) {
  const [count, setCount]     = useState(1);
  const [months, setMonths]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [paid, setPaid]       = useState(false);

  useEffect(() => {
    if (open) { setCount(1); setMonths(1); setError(''); setPaid(false); }
  }, [open]);

  if (!open) return null;

  const pricePerMaster = 45;
  const total = pricePerMaster * count * months;

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      await subscriptionApi.pay(salonId, 'MasterSlots', null, count, months);
      setPaid(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Помилка оплати');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 400, maxWidth: '95vw',
        background: '#fff', borderRadius: 20, border: `1px solid ${peach}`,
        boxShadow: '0 12px 48px rgba(213,122,102,0.18)', padding: '28px',
      }}>
        {paid ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: dark }}>Оплата успішна!</div>
            <div style={{ fontSize: 13, color: gray, marginTop: 6 }}>
              Додано {count} слот(ів) майстрів
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: dark }}>👥 Додати майстрів</div>
                <div style={{ fontSize: 13, color: gray, marginTop: 2 }}>45 ₴ / майстер / місяць</div>
              </div>
              <button onClick={onClose} style={{
                width: 32, height: 32, border: `1px solid ${peach}`,
                borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, color: gray,
              }}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={labelSt}>Кількість слотів</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <button onClick={() => setCount(Math.max(1, count - 1))} style={counterBtn}>−</button>
                <span style={{ fontSize: 22, fontWeight: 800, color: dark, minWidth: 32, textAlign: 'center' }}>{count}</span>
                <button onClick={() => setCount(count + 1)} style={counterBtn}>+</button>
                <span style={{ fontSize: 12, color: gray }}>
                  Ліміт зросте: {currentLimit} → {currentLimit + count}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={labelSt}>Термін</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {MONTHS_OPTIONS.map(({ value, label, discount }) => (
                  <button key={value} onClick={() => setMonths(value)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${months === value ? accent : peach}`,
                    background: months === value ? bg : '#fff',
                    color: months === value ? accent : '#475569',
                    fontSize: 11, fontWeight: months === value ? 700 : 400,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}>
                    {label}
                    {discount && <span style={{ fontSize: 9, color: '#16a34a', fontWeight: 700 }}>{discount}</span>}
                  </button>
                ))}
              </div>
            </div>

            {error && <ErrorBanner msg={error} />}

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: 12, background: bg, border: `1px solid ${peach}`, marginBottom: 14,
            }}>
              <div>
                <div style={{ fontSize: 12, color: gray }}>45 × {count} × {months} міс</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: accent }}>{fmtMoney(total)}</div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginBottom: 12 }}>
              🔒 ТЕСТОВА ОПЛАТА — реальне списання не відбувається
            </div>

            <button onClick={handlePay} disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: loading ? '#e2e8f0' : 'var(--gradient-primary)',
              color: loading ? gray : '#fff',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Обробка...' : `Оплатити ${fmtMoney(total)}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ГОЛОВНА СТОРІНКА ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Огляд'   },
  { id: 'history',  label: 'Платежі' },
];

export default function SubscriptionPage() {
  const salonId = useSalonId();

  const [tab, setTab]               = useState('overview');
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [payModal, setPayModal]     = useState(null); // module name
  const [slotsModal, setSlotsModal] = useState(false);
  const [error, setError]           = useState('');

  const loadSubscription = useCallback(async () => {
    try {
      const { data } = await subscriptionApi.get(salonId);
      setSubscription(data);
    } catch {
      setError('Помилка завантаження підписки');
    }
  }, [salonId]);

  const loadPayments = useCallback(async () => {
    try {
      const { data } = await subscriptionApi.getPayments(salonId);
      setPayments(data || []);
    } catch {
      /* ignore */
    }
  }, [salonId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadSubscription(), loadPayments()]).finally(() => setLoading(false));
  }, [loadSubscription, loadPayments]);

  const handlePaymentSuccess = () => {
    loadSubscription();
    loadPayments();
  };

  if (loading) {
    return (
      <DashboardLayout title="Підписка">
        <div style={{ padding: 24, color: gray, fontSize: 14 }}>Завантаження...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Підписка">
      <div style={{ padding: 24, maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Заголовок */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: dark, margin: 0 }}>Підписка</h2>
          <p style={{ fontSize: 13, color: gray, margin: '4px 0 0' }}>
            Керуйте тарифом, модулями та переглядайте платіжну історію
          </p>
        </div>

        {error && <ErrorBanner msg={error} />}

        {/* Картка підписки */}
        <SubscriptionCard subscription={subscription} />

        {/* Таби */}
        <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${peach}`, paddingBottom: 0 }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '9px 20px', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: tab === id ? 700 : 400,
              color: tab === id ? accent : '#64748b',
              background: 'transparent',
              borderBottom: tab === id ? `2px solid ${accent}` : '2px solid transparent',
              marginBottom: -2, borderRadius: '8px 8px 0 0', transition: 'all 0.15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Огляд */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Модулі */}
            <div>
              <SectionTitle>Модулі</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {Object.keys(MODULE_META).map((name) => (
                  <ModuleCard
                    key={name}
                    name={name}
                    subscription={subscription}
                    onActivate={(mod) => setPayModal(mod)}
                  />
                ))}
              </div>
            </div>

            {/* Слоти майстрів */}
            <div>
              <SectionTitle>Майстри</SectionTitle>
              <div style={{
                background: '#fff', border: `1px solid ${peach}`, borderRadius: 14,
                padding: '20px 22px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: dark }}>
                    Доступних слотів: {subscription?.masterLimit ?? 1}
                  </div>
                  <div style={{ fontSize: 12, color: gray, marginTop: 3 }}>
                    1 слот включено безкоштовно · додаткові — 45 ₴/міс за слот
                  </div>
                </div>
                <button
                  onClick={() => setSlotsModal(true)}
                  style={{
                    padding: '9px 20px', borderRadius: 10, border: `1px solid ${peach}`,
                    background: '#fff', color: accent, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  + Додати слоти
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Історія платежів */}
        {tab === 'history' && (
          <div>
            {payments.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '48px 24px',
                border: `1.5px dashed ${peach}`, borderRadius: 16, color: gray,
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>💳</div>
                <p style={{ fontSize: 14 }}>Платежів ще немає</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: bg }}>
                      {['Дата', 'Опис', 'Сума', 'Статус', 'Нотатка'].map((h) => (
                        <th key={h} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td style={td}>{fmtDate(p.createdAt)}</td>
                        <td style={td}>{p.description}</td>
                        <td style={{ ...td, fontWeight: 700, color: dark }}>{fmtMoney(p.amount)}</td>
                        <td style={td}><StatusBadge status={p.status} /></td>
                        <td style={{ ...td, color: gray }}>{p.note ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальні вікна */}
      <PaymentModal
        open={!!payModal}
        moduleName={payModal ?? ''}
        onClose={() => setPayModal(null)}
        onSuccess={handlePaymentSuccess}
        salonId={salonId}
      />
      <MasterSlotsModal
        open={slotsModal}
        onClose={() => setSlotsModal(false)}
        onSuccess={handlePaymentSuccess}
        salonId={salonId}
        currentLimit={subscription?.masterLimit ?? 1}
      />
    </DashboardLayout>
  );
}

// ─── Стилі ────────────────────────────────────────────────────────────────────

const labelSt = {
  fontSize: 11, fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 5px',
};

const inputSt = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: `1.5px solid ${peach}`, fontSize: 14, color: dark,
  outline: 'none', background: '#f8fafc', boxSizing: 'border-box',
};

const counterBtn = {
  width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${peach}`,
  background: '#fff', cursor: 'pointer', fontSize: 18, color: accent,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
};

const th = {
  padding: '10px 14px', textAlign: 'left',
  fontSize: 11, fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.4px',
  borderBottom: `2px solid ${peach}`,
};

const td = {
  padding: '11px 14px', borderBottom: `1px solid ${peach}`,
  verticalAlign: 'middle',
};
