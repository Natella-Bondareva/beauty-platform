import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../widgets/DashboardLayout';
import { useSalonId } from '../shared/hooks/useSalonId';
import { bookingFieldsApi } from '../features/bookingFields/api/bookingFields.api';
import { salonApi } from '../features/services/api/salon.api';
import { employeeApi } from '../features/employees/api/employee.api';

const accent = '#D57A66';
const peach = '#FFD1B3';

const TYPE_ENUM = { Text: 0, TextArea: 1, YesNo: 2, Select: 3, FileUpload: 4 };
const TYPE_FROM_INT = Object.fromEntries(Object.entries(TYPE_ENUM).map(([k, v]) => [v, k]));

const SCOPE_ENUM = { Salon: 0, Service: 1, Master: 2 };
const SCOPE_FROM_INT = Object.fromEntries(Object.entries(SCOPE_ENUM).map(([k, v]) => [v, k]));

const TYPE_LABELS = {
  Text: 'Текст',
  TextArea: 'Довгий текст',
  YesNo: 'Так / Ні',
  Select: 'Список варіантів',
  FileUpload: 'Завантаження файлу',
};

const SCOPE_LABELS = {
  Salon: 'Для всього салону',
  Service: 'Для послуги',
  Master: 'Для майстра',
};

// ── Компонент картки поля ────────────────────────────────────────────
function FieldCard({ field, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${peach}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      {/* Reorder buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          title="Вгору"
          style={arrowBtnStyle(isFirst)}
        >▲</button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          title="Вниз"
          style={arrowBtnStyle(isLast)}
        >▼</button>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{field.label}</span>
          {field.isRequired && (
            <span style={badge('#fef2f2', '#ef4444')}>Обов'язкове</span>
          )}
          <span style={badge('#f0fdf4', '#16a34a')}>{TYPE_LABELS[field.type] ?? field.type}</span>
          <span style={badge('#EFF6FF', '#3B82F6')}>{SCOPE_LABELS[field.scope] ?? field.scope}</span>
        </div>
        {field.placeholder && (
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
            Підказка: {field.placeholder}
          </p>
        )}
        {field.type === 'Select' && field.options?.length > 0 && (
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
            Варіанти: {field.options.join(', ')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {confirmDelete ? (
          <>
            <button onClick={() => onDelete(field.id)} style={dangerBtnStyle}>Видалити</button>
            <button onClick={() => setConfirmDelete(false)} style={secondaryBtnStyle}>Скасувати</button>
          </>
        ) : (
          <>
            <button onClick={() => onEdit(field)} style={iconBtnStyle} title="Редагувати">✏️</button>
            <button onClick={() => setConfirmDelete(true)} style={iconBtnStyle} title="Видалити">🗑️</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Форма створення / редагування ────────────────────────────────────
function FieldForm({ initial, services, employees, onSave, onCancel, saving }) {
  const isEdit = !!initial?.id;

  const [label, setLabel] = useState(initial?.label ?? '');
  const [placeholder, setPlaceholder] = useState(initial?.placeholder ?? '');
  const [type, setType] = useState(initial?.type ?? 'Text');
  const [scope, setScope] = useState(initial?.scope ?? 'Salon');
  const [targetId, setTargetId] = useState(initial?.targetId ?? '');
  const [isRequired, setIsRequired] = useState(initial?.isRequired ?? false);
  const [options, setOptions] = useState(initial?.options ?? []);
  const [newOption, setNewOption] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!label.trim()) e.label = "Назва обов'язкова";
    if ((scope === 'Service' || scope === 'Master') && !targetId) {
      e.targetId = 'Оберіть елемент';
    }
    if (type === 'Select' && options.length === 0) {
      e.options = 'Додайте хоча б один варіант';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      label: label.trim(),
      placeholder: placeholder.trim() || null,
      type,
      scope,
      targetId: (scope === 'Salon' ? null : targetId) || null,
      isRequired,
      options: type === 'Select' ? options : [],
    });
  };

  const addOption = () => {
    const v = newOption.trim();
    if (v && !options.includes(v)) {
      setOptions((p) => [...p, v]);
      setNewOption('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Label */}
      <div>
        <label style={labelStyle}>Назва поля *</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="наприклад: Чи є алергія на косметику?"
          style={inputStyle(errors.label)}
        />
        {errors.label && <p style={errStyle}>{errors.label}</p>}
      </div>

      {/* Placeholder */}
      <div>
        <label style={labelStyle}>Підказка (placeholder)</label>
        <input
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
          placeholder="Текст всередині поля"
          style={inputStyle()}
        />
      </div>

      {/* Type — тільки при створенні */}
      <div>
        <label style={labelStyle}>Тип поля {isEdit && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(не можна змінити)</span>}</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isEdit}
          style={inputStyle()}
        >
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Options — тільки для Select */}
      {type === 'Select' && (
        <div>
          <label style={labelStyle}>Варіанти відповіді *</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
              placeholder="Додати варіант..."
              style={{ ...inputStyle(), flex: 1, marginBottom: 0 }}
            />
            <button onClick={addOption} style={primaryBtnStyle}>+</button>
          </div>
          {options.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {options.map((opt) => (
                <span key={opt} style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: '#FFF5F0',
                  border: `1px solid ${peach}`,
                  fontSize: 12,
                  color: accent,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  {opt}
                  <button
                    onClick={() => setOptions((p) => p.filter((o) => o !== opt))}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, fontSize: 12 }}
                  >×</button>
                </span>
              ))}
            </div>
          )}
          {errors.options && <p style={errStyle}>{errors.options}</p>}
        </div>
      )}

      {/* Scope — тільки при створенні */}
      <div>
        <label style={labelStyle}>Область застосування {isEdit && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(не можна змінити)</span>}</label>
        <select
          value={scope}
          onChange={(e) => { setScope(e.target.value); setTargetId(''); }}
          disabled={isEdit}
          style={inputStyle()}
        >
          {Object.entries(SCOPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Target dropdown */}
      {scope === 'Service' && (
        <div>
          <label style={labelStyle}>Послуга *</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            disabled={isEdit}
            style={inputStyle(errors.targetId)}
          >
            <option value="">Оберіть послугу</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.targetId && <p style={errStyle}>{errors.targetId}</p>}
        </div>
      )}

      {scope === 'Master' && (
        <div>
          <label style={labelStyle}>Майстер *</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            disabled={isEdit}
            style={inputStyle(errors.targetId)}
          >
            <option value="">Оберіть майстра</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.fullName}</option>
            ))}
          </select>
          {errors.targetId && <p style={errStyle}>{errors.targetId}</p>}
        </div>
      )}

      {/* isRequired */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={isRequired}
          onChange={(e) => setIsRequired(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: accent }}
        />
        <span style={{ fontSize: 14, color: '#1E293B' }}>Обов'язкове поле</span>
      </label>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button onClick={handleSave} disabled={saving} style={{ ...primaryBtnStyle, flex: 1 }}>
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
        <button onClick={onCancel} style={{ ...secondaryBtnStyle, flex: 1 }}>
          Скасувати
        </button>
      </div>
    </div>
  );
}

// ── Slide panel ───────────────────────────────────────────────────────
function SidePanel({ open, title, children }) {
  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 200,
          backdropFilter: 'blur(2px)',
        }} />
      )}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 420,
        background: '#fff',
        borderLeft: `1px solid ${peach}`,
        boxShadow: '-4px 0 24px rgba(213,122,102,0.12)',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{
          padding: '18px 20px',
          borderBottom: `1px solid ${peach}`,
          fontSize: 16,
          fontWeight: 700,
          color: '#1E293B',
          flexShrink: 0,
        }}>
          {title}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ── Головна сторінка ─────────────────────────────────────────────────
export default function BookingFieldsPage() {
  const salonId = useSalonId();
  const [fields, setFields] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingField, setEditingField] = useState(null); // null = create
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Нормалізуємо числові enum-и з бекенду назад у рядки для UI
  const normalizeField = (f) => ({
    ...f,
    type: typeof f.type === 'number' ? (TYPE_FROM_INT[f.type] ?? f.type) : f.type,
    scope: typeof f.scope === 'number' ? (SCOPE_FROM_INT[f.scope] ?? f.scope) : f.scope,
  });

  const loadFields = () => {
    if (!salonId) return;
    setLoading(true);
    bookingFieldsApi.getAll(salonId)
      .then((r) => setFields((r.data || []).map(normalizeField)))
      .catch(() => setError('Не вдалось завантажити поля'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!salonId) return;
    loadFields();
    Promise.all([
      salonApi.getServices(salonId),
      employeeApi.getAll(salonId),
    ]).then(([svcRes, empRes]) => {
      setServices(svcRes.data || []);
      setEmployees(empRes.data || []);
    }).catch(() => {});
  }, [salonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditingField(null); setPanelOpen(true); };
  const openEdit = (field) => { setEditingField(field); setPanelOpen(true); };
  const closePanel = () => { setPanelOpen(false); setEditingField(null); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingField) {
        await bookingFieldsApi.update(salonId, editingField.id, {
          label: data.label,
          placeholder: data.placeholder,
          isRequired: data.isRequired,
        });
      } else {
        await bookingFieldsApi.create(salonId, {
          ...data,
          type: TYPE_ENUM[data.type] ?? data.type,
          scope: SCOPE_ENUM[data.scope] ?? data.scope,
          order: fields.length,
        });
      }
      closePanel();
      loadFields();
    } catch (err) {
      setError(err?.response?.data?.error || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fieldId) => {
    try {
      await bookingFieldsApi.delete(salonId, fieldId);
      loadFields();
    } catch {
      setError('Не вдалось видалити поле');
    }
  };

  const handleMove = async (index, direction) => {
    const next = [...fields];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    // Оновлюємо order локально і надсилаємо на бекенд
    setFields(next);
    try {
      await Promise.all([
        bookingFieldsApi.update(salonId, next[index].id, { order: index }),
        bookingFieldsApi.update(salonId, next[swapIndex].id, { order: swapIndex }),
      ]);
    } catch {
      loadFields(); // відновлюємо якщо помилка
    }
  };

  return (
    <DashboardLayout title="Поля форми запису">
      <div style={{ padding: 24, maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', margin: 0 }}>
              Поля форми запису
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
              Клієнти бачать ці поля на останньому кроці перед підтвердженням запису
            </p>
          </div>
          <button onClick={openCreate} style={primaryBtnStyle}>
            + Додати поле
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Field list */}
        {loading ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Завантаження...</p>
        ) : fields.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            border: `1.5px dashed ${peach}`,
            borderRadius: 16,
            color: '#94a3b8',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Полів ще немає
            </p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>
              Додайте поля, щоб збирати додаткову інформацію від клієнтів при записі
            </p>
            <button onClick={openCreate} style={primaryBtnStyle}>
              Додати перше поле
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fields.map((field, i) => (
              <FieldCard
                key={field.id}
                field={field}
                onEdit={openEdit}
                onDelete={handleDelete}
                onMoveUp={() => handleMove(i, -1)}
                onMoveDown={() => handleMove(i, 1)}
                isFirst={i === 0}
                isLast={i === fields.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side panel */}
      <SidePanel
        open={panelOpen}
        title={editingField ? 'Редагувати поле' : 'Нове поле'}
      >
        {panelOpen && (
          <FieldForm
            initial={editingField}
            services={services}
            employees={employees}
            onSave={handleSave}
            onCancel={closePanel}
            saving={saving}
          />
        )}
      </SidePanel>
    </DashboardLayout>
  );
}

// ── Допоміжні стилі ───────────────────────────────────────────────────
const primaryBtnStyle = {
  padding: '9px 18px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--gradient-primary)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const secondaryBtnStyle = {
  padding: '9px 18px',
  borderRadius: 10,
  border: `1px solid ${peach}`,
  background: '#fff',
  color: accent,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const dangerBtnStyle = {
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid #fecaca',
  background: '#fef2f2',
  color: '#ef4444',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const iconBtnStyle = {
  padding: '6px 8px',
  borderRadius: 8,
  border: `1px solid ${peach}`,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 14,
};

const arrowBtnStyle = (disabled) => ({
  width: 22,
  height: 22,
  border: `1px solid ${peach}`,
  borderRadius: 6,
  background: disabled ? '#f8fafc' : '#fff',
  color: disabled ? '#cbd5e1' : '#64748b',
  cursor: disabled ? 'default' : 'pointer',
  fontSize: 9,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
});

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
};

const inputStyle = (error) => ({
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  border: `1.5px solid ${error ? '#fca5a5' : peach}`,
  fontSize: 14,
  color: '#1E293B',
  outline: 'none',
  background: error ? '#fff5f5' : '#fff',
  boxSizing: 'border-box',
});

const errStyle = {
  fontSize: 12,
  color: '#ef4444',
  margin: '4px 0 0',
};

const badge = (bg, color) => ({
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 20,
  background: bg,
  color,
});
