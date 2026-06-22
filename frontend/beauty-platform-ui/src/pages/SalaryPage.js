import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../widgets/DashboardLayout';
import { useSalonId } from '../shared/hooks/useSalonId';
import { salaryApi, CONTRACT_TYPE_ENUM, CONTRACT_TYPE_FROM_INT, CONTRACT_TYPE_LABELS } from '../features/salary/api/salary.api';
import { employeeApi } from '../features/employees/api/employee.api';

const accent = '#D57A66';
const peach  = '#FFD1B3';
const bg     = '#FFF5F0';
const gray   = '#94a3b8';
const dark   = '#1E293B';

// ─── Утиліти ─────────────────────────────────────────────────────────────────

const PAYMENT_STATUS = { Pending: 'Очікує', Paid: 'Виплачено' };

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtMoney(n) {
  return n != null ? `${Number(n).toLocaleString('uk-UA')} ₴` : '—';
}

function isoDate(d) { return d.toISOString().slice(0, 10); }
function monthStart() { const d = new Date(); return isoDate(new Date(d.getFullYear(), d.getMonth(), 1)); }
function today()      { return isoDate(new Date()); }

// ─── Загальні компоненти ──────────────────────────────────────────────────────

function Modal({ open, title, onClose, children, width = 440 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
        background: '#fff', borderRadius: 16, border: `1px solid ${peach}`,
        boxShadow: '0 8px 40px rgba(213,122,102,0.15)', padding: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: dark }}>{title}</span>
          <button onClick={onClose} style={iconBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
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

function EmptyState({ text }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      border: `1.5px dashed ${peach}`, borderRadius: 16, color: gray,
    }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>💰</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

function Badge({ status }) {
  const isPaid = status === 'Paid';
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: isPaid ? '#f0fdf4' : '#fefce8',
      color: isPaid ? '#16a34a' : '#ca8a04',
      border: `1px solid ${isPaid ? '#bbf7d0' : '#fde68a'}`,
    }}>
      {PAYMENT_STATUS[status] ?? status}
    </span>
  );
}

// ─── ВКЛАДКА «МАЙСТРИ» ────────────────────────────────────────────────────────

function MasterPayrollCard({ employee, contract, forecast, recentPayments, salonId, onPaid }) {
  const [paying, setPaying]           = useState(false);
  const [periodStart, setPeriodStart] = useState(monthStart);
  const [periodEnd, setPeriodEnd]     = useState(today);
  const [note, setNote]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const hasContract = !!contract;
  const earned      = forecast?.earnedSoFar ?? 0;
  const forecastAmt = forecast?.forecastAmount ?? 0;
  const completed   = forecast?.completedBookingsCount ?? 0;
  const planned     = forecast?.plannedBookingsCount ?? 0;
  const total       = completed + planned;
  const pct         = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: payment } = await salaryApi.generatePayment(salonId, {
        masterId: employee.id,
        periodStart,
        periodEnd,
      });
      await salaryApi.markAsPaid(salonId, payment.id, note.trim() || null);
      setPaying(false);
      setNote('');
      onPaid();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || 'Помилка виплати');
    } finally {
      setLoading(false);
    }
  };

  const contractLabel = contract
    ? `${CONTRACT_TYPE_LABELS[CONTRACT_TYPE_FROM_INT[contract.type]] ?? contract.type} · ${
        (CONTRACT_TYPE_FROM_INT[contract.type] ?? contract.type) === 'Percentage'
          ? `${contract.amount}%`
          : fmtMoney(contract.amount)
      }`
    : null;

  return (
    <div style={{
      background: '#fff', border: `1px solid ${peach}`,
      borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column',
    }}>
      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={avatarCircle}>{employee.fullName?.[0] ?? '?'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: dark, margin: 0 }}>{employee.fullName}</p>
          {contractLabel
            ? <p style={{ fontSize: 12, color: gray, margin: '2px 0 0' }}>{contractLabel}</p>
            : <p style={{ fontSize: 12, color: '#f59e0b', margin: '2px 0 0' }}>Без контракту — налаштуйте у вкладці «Контракти»</p>
          }
        </div>
      </div>

      {/* Зароблено цього місяця */}
      {hasContract && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Зароблено цього місяця
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: accent }}>{fmtMoney(earned)}</span>
          </div>

          <div style={{ background: '#f1f5f9', borderRadius: 6, height: 7, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: `linear-gradient(90deg, ${peach}, ${accent})`,
              borderRadius: 6, transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: gray, marginBottom: 16 }}>
            <span>{completed} виконано · {planned} заплановано</span>
            {forecastAmt > earned && <span>Прогноз: {fmtMoney(forecastAmt)}</span>}
          </div>

          {/* Кнопка / форма виплати */}
          {!paying ? (
            <button
              onClick={() => { setPaying(true); setPeriodStart(monthStart()); setPeriodEnd(today()); }}
              style={{ ...primaryBtn, width: '100%' }}
            >
              Виплатити
            </button>
          ) : (
            <div style={{
              background: bg, border: `1px solid ${peach}`,
              borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: dark, margin: 0 }}>Оформити виплату</p>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={labelSt}>Початок</p>
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} style={inputSt} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={labelSt}>Кінець</p>
                  <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} style={inputSt} />
                </div>
              </div>

              <div>
                <p style={labelSt}>Нотатка (необов'язково)</p>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Наприклад: готівка"
                  style={inputSt}
                />
              </div>

              {error && <ErrorBanner msg={error} />}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handlePay} disabled={loading} style={{ ...primaryBtn, flex: 1 }}>
                  {loading ? 'Збереження...' : 'Підтвердити виплату'}
                </button>
                <button onClick={() => { setPaying(false); setError(''); }} style={outlineBtn}>
                  Скасувати
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Останні виплати */}
      {recentPayments.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${peach}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 8px' }}>
            Останні виплати
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentPayments.slice(0, 4).map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: gray }}>{fmtDate(p.periodStart)} – {fmtDate(p.periodEnd)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: dark }}>{fmtMoney(p.earnedAmount)}</span>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MastersTab({ salonId }) {
  const [employees, setEmployees] = useState([]);
  const [contracts, setContracts] = useState({});
  const [forecast, setForecast]   = useState({});
  const [payments, setPayments]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [empsRes, forecastRes, paymentsRes] = await Promise.all([
        employeeApi.getAll(salonId),
        salaryApi.getForecast(salonId).catch(() => ({ data: [] })),
        salaryApi.getPayments(salonId, { from: '2020-01-01', to: today() }).catch(() => ({ data: [] })),
      ]);

      const emps = empsRes.data || [];
      setEmployees(emps);

      const contractResults = await Promise.allSettled(
        emps.map((e) => salaryApi.getContract(salonId, e.id))
      );
      const contractMap = {};
      emps.forEach((e, i) => {
        contractMap[e.id] = contractResults[i].status === 'fulfilled' ? contractResults[i].value.data : null;
      });
      setContracts(contractMap);

      const forecastMap = {};
      (forecastRes.data || []).forEach((f) => { forecastMap[f.masterId] = f; });
      setForecast(forecastMap);

      const payMap = {};
      (paymentsRes.data || []).forEach((p) => {
        (payMap[p.masterId] ??= []).push(p);
      });
      Object.values(payMap).forEach((list) => list.sort((a, b) => new Date(b.periodEnd) - new Date(a.periodEnd)));
      setPayments(payMap);
    } catch {
      setError('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p style={loadingText}>Завантаження...</p>;
  if (error)   return <ErrorBanner msg={error} />;
  if (employees.length === 0)
    return <EmptyState text="Майстрів ще немає. Спочатку додайте майстрів у розділі «Майстри»." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      {employees.map((emp) => (
        <MasterPayrollCard
          key={emp.id}
          employee={emp}
          contract={contracts[emp.id]}
          forecast={forecast[emp.id]}
          recentPayments={payments[emp.id] ?? []}
          salonId={salonId}
          onPaid={load}
        />
      ))}
    </div>
  );
}

// ─── ВКЛАДКА «КОНТРАКТИ» ──────────────────────────────────────────────────────

function QuickDays({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
      {[7, 14, 30].map((d) => (
        <button key={d} type="button" onClick={() => onChange(d)} style={{
          padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          border: `1px solid ${value === d ? accent : peach}`,
          background: value === d ? bg : '#fff',
          color: value === d ? accent : gray,
        }}>
          {d} днів
        </button>
      ))}
    </div>
  );
}

function ContractForm({ initial, onSubmit, saving }) {
  const initTypeStr = typeof initial?.type === 'number'
    ? (CONTRACT_TYPE_FROM_INT[initial.type] ?? 'FixedRate')
    : (initial?.type ?? 'FixedRate');

  const [type, setType]         = useState(initTypeStr);
  const [amount, setAmount]     = useState(initial?.amount ?? '');
  const [periodDays, setPeriod] = useState(initial?.paymentPeriodDays ?? 30);

  const handle = (e) => {
    e.preventDefault();
    onSubmit({ type: CONTRACT_TYPE_ENUM[type], amount: Number(amount), paymentPeriodDays: Number(periodDays) });
  };

  return (
    <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <p style={labelSt}>Тип нарахування</p>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['FixedRate', 'Фіксована ставка'], ['Percentage', 'Відсоток від записів']].map(([v, l]) => (
            <label key={v} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${type === v ? accent : peach}`,
              background: type === v ? bg : '#fff',
              fontSize: 13, fontWeight: type === v ? 600 : 400,
              color: type === v ? accent : '#475569',
            }}>
              <input type="radio" name="type" value={v} checked={type === v}
                onChange={() => setType(v)} style={{ display: 'none' }} />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p style={labelSt}>Сума {type === 'Percentage' ? '(%)' : '(грн)'}</p>
        <div style={{ position: 'relative' }}>
          <input type="number" min="0" step="0.01" required
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder={type === 'Percentage' ? '20' : '5000'}
            style={{ ...inputSt, paddingRight: 40 }} />
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: gray, pointerEvents: 'none' }}>
            {type === 'Percentage' ? '%' : '₴'}
          </span>
        </div>
      </div>

      <div>
        <p style={labelSt}>Період виплати</p>
        <div style={{ position: 'relative' }}>
          <input type="number" min="1" required
            value={periodDays} onChange={(e) => setPeriod(e.target.value)}
            style={{ ...inputSt, paddingRight: 50 }} />
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: gray, pointerEvents: 'none' }}>
            днів
          </span>
        </div>
        <QuickDays value={Number(periodDays)} onChange={setPeriod} />
      </div>

      <button type="submit" disabled={saving} style={{ ...primaryBtn, marginTop: 4 }}>
        {saving ? 'Збереження...' : 'Зберегти'}
      </button>
    </form>
  );
}

function ContractsTab({ salonId }) {
  const [employees, setEmployees]     = useState([]);
  const [contracts, setContracts]     = useState({});
  const [loading, setLoading]         = useState(true);
  const [modalMaster, setModalMaster] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: emps } = await employeeApi.getAll(salonId);
      setEmployees(emps || []);
      const results = await Promise.allSettled(
        (emps || []).map((e) => salaryApi.getContract(salonId, e.id))
      );
      const map = {};
      (emps || []).forEach((e, i) => {
        map[e.id] = results[i].status === 'fulfilled' ? results[i].value.data : null;
      });
      setContracts(map);
    } catch {
      setError('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const contract = contracts[modalMaster.id];
      if (contract?.id) {
        await salaryApi.updateContract(salonId, contract.id, { amount: formData.amount, paymentPeriodDays: formData.paymentPeriodDays });
      } else {
        await salaryApi.createContract(salonId, { masterId: modalMaster.id, ...formData });
      }
      setModalMaster(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={loadingText}>Завантаження...</p>;

  return (
    <>
      {error && <ErrorBanner msg={error} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {employees.length === 0 && (
          <EmptyState text="Майстрів ще немає. Спочатку додайте майстрів у розділі «Майстри»." />
        )}
        {employees.map((emp) => {
          const c = contracts[emp.id];
          return (
            <div key={emp.id} style={rowCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={avatarCircle}>{emp.fullName?.[0] ?? '?'}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: dark, margin: 0 }}>{emp.fullName}</p>
                  {c ? (
                    <p style={{ fontSize: 12, color: gray, margin: '2px 0 0' }}>
                      {CONTRACT_TYPE_LABELS[CONTRACT_TYPE_FROM_INT[c.type]] ?? c.type}
                      {' · '}
                      {(CONTRACT_TYPE_FROM_INT[c.type] ?? c.type) === 'Percentage' ? `${c.amount}%` : fmtMoney(c.amount)}
                      {' · '}{c.paymentPeriodDays} днів
                    </p>
                  ) : (
                    <p style={{ fontSize: 12, color: '#f59e0b', margin: '2px 0 0' }}>Без контракту</p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{
                  ...miniTag,
                  ...(c
                    ? { background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }
                    : { background: '#fefce8', color: '#ca8a04', borderColor: '#fde68a' })
                }}>
                  {c ? 'Активний' : 'Немає'}
                </span>
                <button onClick={() => setModalMaster({ ...emp, contract: c })} style={c ? outlineBtn : primaryBtn}>
                  {c ? 'Редагувати' : 'Налаштувати'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!modalMaster}
        title={contracts[modalMaster?.id]?.id ? 'Редагувати контракт' : 'Новий контракт'}
        onClose={() => { setModalMaster(null); setError(''); }}
      >
        {modalMaster && (
          <>
            <p style={{ fontSize: 13, color: gray, marginBottom: 16 }}>
              Майстер: <strong style={{ color: dark }}>{modalMaster.fullName}</strong>
            </p>
            {error && <ErrorBanner msg={error} />}
            <ContractForm initial={contracts[modalMaster.id]} onSubmit={handleSubmit} saving={saving} />
          </>
        )}
      </Modal>
    </>
  );
}

// ─── ВКЛАДКА «ВИПЛАТИ / ІСТОРІЯ» ─────────────────────────────────────────────

function PaymentsHistoryTab({ salonId }) {
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [masterId, setMasterId]   = useState('');
  const [from, setFrom]           = useState(monthStart());
  const [to, setTo]               = useState(today());

  const loadPayments = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await salaryApi.getPayments(salonId, params);
      setPayments(data || []);
    } catch {
      setError('Помилка завантаження виплат');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    employeeApi.getAll(salonId).then((r) => setEmployees(r.data || [])).catch(() => {});
    loadPayments({ from, to });
  }, [salonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = () => loadPayments({ masterId: masterId || undefined, from, to });

  return (
    <>
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end',
        padding: '14px 16px', borderRadius: 12, border: `1px solid ${peach}`,
        background: '#fff', marginBottom: 16,
      }}>
        <div>
          <p style={labelSt}>Майстер</p>
          <select value={masterId} onChange={(e) => setMasterId(e.target.value)} style={{ ...inputSt, minWidth: 180 }}>
            <option value="">Всі майстри</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
          </select>
        </div>
        <div>
          <p style={labelSt}>Від</p>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputSt} />
        </div>
        <div>
          <p style={labelSt}>До</p>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputSt} />
        </div>
        <button onClick={apply} style={primaryBtn}>Застосувати</button>
      </div>

      {error && <ErrorBanner msg={error} />}

      {loading ? (
        <p style={loadingText}>Завантаження...</p>
      ) : payments.length === 0 ? (
        <EmptyState text="Виплат за обраний період немає." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: bg }}>
                {['Майстер', 'Період', 'Нараховано', 'Прогноз', 'Статус', 'Нотатка'].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={td}>{p.masterName || employees.find((e) => e.id === p.masterId)?.fullName || '—'}</td>
                  <td style={td}><span style={{ fontSize: 12 }}>{fmtDate(p.periodStart)} – {fmtDate(p.periodEnd)}</span></td>
                  <td style={{ ...td, fontWeight: 600 }}>{fmtMoney(p.earnedAmount)}</td>
                  <td style={{ ...td, color: gray }}>{fmtMoney(p.forecastAmount)}</td>
                  <td style={td}><Badge status={p.status} /></td>
                  <td style={{ ...td, color: gray, fontSize: 12 }}>{p.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Головна сторінка ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'masters',   label: 'Майстри'   },
  { id: 'contracts', label: 'Контракти' },
  { id: 'history',   label: 'Виплати'   },
];

export default function SalaryPage() {
  const salonId = useSalonId();
  const [tab, setTab] = useState('masters');

  return (
    <DashboardLayout title="Зарплати">
      <div style={{ padding: 24, maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: dark, margin: 0 }}>Розрахунок зарплат</h2>
          <p style={{ fontSize: 13, color: gray, margin: '4px 0 0' }}>
            Контракти, виплати та заробіток майстрів
          </p>
        </div>

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

        <div>
          {tab === 'masters'   && <MastersTab          salonId={salonId} />}
          {tab === 'contracts' && <ContractsTab         salonId={salonId} />}
          {tab === 'history'   && <PaymentsHistoryTab   salonId={salonId} />}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Стилі ────────────────────────────────────────────────────────────────────

const primaryBtn = {
  padding: '9px 18px', borderRadius: 10, border: 'none',
  background: 'var(--gradient-primary)', color: '#fff',
  fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
};

const outlineBtn = {
  padding: '9px 18px', borderRadius: 10, border: `1px solid ${peach}`,
  background: '#fff', color: accent, fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const iconBtn = {
  width: 32, height: 32, borderRadius: 8, border: `1px solid ${peach}`,
  background: '#fff', cursor: 'pointer', fontSize: 16, color: gray,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const inputSt = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: `1.5px solid ${peach}`, fontSize: 14, color: dark,
  outline: 'none', background: '#fff', boxSizing: 'border-box',
};

const labelSt = {
  fontSize: 11, fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 5px',
};

const rowCard = {
  display: 'flex', alignItems: 'center', gap: 12,
  background: '#fff', border: `1px solid ${peach}`,
  borderRadius: 12, padding: '12px 16px',
};

const avatarCircle = {
  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
  background: 'var(--gradient-primary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 15, fontWeight: 700, color: '#fff',
};

const miniTag = {
  fontSize: 11, fontWeight: 600, padding: '3px 9px',
  borderRadius: 20, border: '1px solid', whiteSpace: 'nowrap',
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

const loadingText = { color: gray, fontSize: 14, padding: '24px 0' };
