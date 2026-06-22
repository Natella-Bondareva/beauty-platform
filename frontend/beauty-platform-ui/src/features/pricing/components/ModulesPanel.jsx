import { useState, useEffect } from 'react';
import { subscriptionApi } from '../api/subscription.api';
import { useSalonId } from '../../../shared/hooks/useSalonId';

const MONTH_OPTIONS = [
  { value: 1, label: '1 міс' },
  { value: 3, label: '3 міс' },
  { value: 6, label: '6 міс' },
  { value: 12, label: '12 міс' },
];

export default function ModulesPanel() {
  const salonId = useSalonId();
  const [config, setConfig] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [adding, setAdding] = useState(null);
  const [addError, setAddError] = useState(null);
  const [justAdded, setJustAdded] = useState(null);

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    Promise.all([
      subscriptionApi.getConfig(),
      subscriptionApi.get(salonId),
    ])
      .then(([cfgRes, subRes]) => {
        setConfig(cfgRes.data);
        setSubscription(subRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [salonId]);

  if (loading || !config) return null;

  // Active module names from current subscription
  const activeModuleNames = new Set(
    (subscription?.modules || []).map(m => m.module)
  );

  const isModuleActive = (mod) =>
    mod.isFree || activeModuleNames.has(mod.name);

  const currentMonthly = subscription?.monthlyPrice ?? 0;

  const handleToggleExpand = (modId) => {
    setExpandedId(prev => (prev === modId ? null : modId));
    setAddError(null);
  };

  const handleAdd = async (mod) => {
    setAdding(mod.id);
    setAddError(null);
    try {
      await subscriptionApi.addModule(salonId, mod.id, selectedMonths);
      const subRes = await subscriptionApi.get(salonId);
      setSubscription(subRes.data);
      setExpandedId(null);
      setJustAdded(mod.id);
      setTimeout(() => setJustAdded(null), 3000);
    } catch (err) {
      setAddError(err?.response?.data?.error || 'Помилка. Спробуйте ще раз.');
    } finally {
      setAdding(null);
    }
  };

  const allModules = [...config.freeModules, ...config.paidModules];

  return (
    <aside style={{
      width: 264,
      flexShrink: 0,
      borderLeft: '1px solid var(--secondary-color, #e2e8f0)',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--secondary-color, #e2e8f0)',
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #1e293b)', margin: 0 }}>
          Модулі
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)', margin: '2px 0 0' }}>
          {currentMonthly > 0
            ? `Поточний план: ${currentMonthly} грн / міс`
            : 'Безкоштовний план'}
        </p>
      </div>

      {/* Module list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {allModules.map(mod => {
          const active = isModuleActive(mod);
          const expanded = expandedId === mod.id;
          const success = justAdded === mod.id;
          const addCost = mod.price * selectedMonths;
          const newMonthly = currentMonthly + mod.price;

          return (
            <div key={mod.id}>
              {/* Module row */}
              <button
                type="button"
                onClick={() => !active && handleToggleExpand(mod.id)}
                disabled={active}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  background: expanded ? 'var(--gradient-primary, #fff5f0)' : 'transparent',
                  border: 'none',
                  cursor: active ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                {/* Status icon */}
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  background: success
                    ? '#22c55e22'
                    : active
                      ? 'var(--gradient-primary, #FFD1B322)'
                      : '#f1f5f9',
                  border: `1.5px solid ${
                    success ? '#22c55e' : active ? 'var(--accent-color, #D57A66)' : '#cbd5e1'
                  }`,
                  color: success
                    ? '#22c55e'
                    : active
                      ? 'var(--accent-color, #D57A66)'
                      : '#94a3b8',
                  transition: 'all 0.2s',
                }}>
                  {success ? '✓' : active ? '✓' : '🔒'}
                </span>

                {/* Name + price */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: active ? 'var(--text-primary, #1e293b)' : '#64748b',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {mod.name}
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '1px 0 0' }}>
                    {mod.isFree
                      ? 'Безкоштовно'
                      : active
                        ? 'Активний'
                        : `${mod.price} грн / міс`}
                  </p>
                </div>

                {/* Chevron for inactive paid modules */}
                {!active && !mod.isFree && (
                  <span style={{
                    fontSize: 10,
                    color: '#94a3b8',
                    transform: expanded ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}>▼</span>
                )}
              </button>

              {/* Expanded pricing panel */}
              {expanded && !active && (
                <div style={{
                  margin: '0 12px 8px',
                  borderRadius: 10,
                  border: '1px solid var(--secondary-color, #e2e8f0)',
                  background: '#f8fafc',
                  padding: '12px',
                }}>
                  {/* Month selector */}
                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px', fontWeight: 600 }}>
                    Термін підключення
                  </p>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {MONTH_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedMonths(opt.value)}
                        style={{
                          flex: 1,
                          padding: '4px 2px',
                          fontSize: 11,
                          borderRadius: 6,
                          border: `1px solid ${selectedMonths === opt.value ? 'var(--accent-color, #D57A66)' : '#e2e8f0'}`,
                          background: selectedMonths === opt.value ? 'var(--gradient-primary, #fff5f0)' : '#fff',
                          color: selectedMonths === opt.value ? 'var(--accent-color, #D57A66)' : '#64748b',
                          fontWeight: selectedMonths === opt.value ? 700 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Pricing info */}
                  <div style={{
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid var(--secondary-color, #e2e8f0)',
                    padding: '10px',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>До сплати зараз</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-color, #D57A66)' }}>
                        {addCost} грн
                      </span>
                    </div>
                    <div style={{ height: 1, background: '#f1f5f9', margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Новий план / міс</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                        {newMonthly} грн
                      </span>
                    </div>
                  </div>

                  {addError && (
                    <p style={{ fontSize: 11, color: '#ef4444', margin: '0 0 8px', textAlign: 'center' }}>
                      {addError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAdd(mod)}
                    disabled={adding === mod.id}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: 8,
                      border: 'none',
                      background: adding === mod.id
                        ? '#e2e8f0'
                        : 'var(--accent-color, #D57A66)',
                      color: adding === mod.id ? '#94a3b8' : '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: adding === mod.id ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {adding === mod.id ? 'Підключення...' : `Підключити за ${addCost} грн`}
                  </button>
                </div>
              )}

              {/* Success flash */}
              {success && (
                <div style={{
                  margin: '0 12px 8px',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  fontSize: 12,
                  color: '#16a34a',
                  textAlign: 'center',
                }}>
                  Модуль успішно підключено!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--secondary-color, #e2e8f0)',
        fontSize: 11,
        color: '#94a3b8',
        textAlign: 'center',
      }}>
        Натисніть на модуль, щоб підключити
      </div>
    </aside>
  );
}
