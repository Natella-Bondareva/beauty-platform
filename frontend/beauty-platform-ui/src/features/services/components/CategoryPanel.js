import React, { useState } from 'react';
import ServiceRow from './ServiceRow';
import { FieldLabel } from '../../../shared/ui/FieldLabel';
import { accent, peach, inputStyle } from '../../../shared/ui/tokens';
import { useSalonServices } from '../hooks/useSalonServices';
import Icon from '../../../components/dashboard/Icon';

const EMPTY_FORM = { name: '', description: '', systemDurationMinutes: '', clientDurationMinutes: '', price: '' };

export default function CategoryPanel({ cat, services, onClose }) {
  const { createMutation, updateMutation, deleteMutation } = useSalonServices();

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState('');

  const catServices = services.filter(
    (s) =>
      (s.categoryId != null && String(s.categoryId) === String(cat.id)) ||
      s.category?.trim() === cat.name?.trim()
  );

  const addedNames = new Set(catServices.map((s) => s.name.toLowerCase()));
  const suggested = (cat.defaultServices ?? []).filter(
    (ds) => !addedNames.has(ds.name.toLowerCase())
  );

  const loading =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleStartEdit = (svc) => {
    setEditId(svc.id);
    setEditForm({
      name: svc.name,
      description: svc.description ?? '',
      systemDurationMinutes: String(svc.systemDurationMinutes),
      clientDurationMinutes: String(svc.clientDurationMinutes),
      price: String(svc.price),
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateMutation.mutateAsync({
        id: editId,
        data: {
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          systemDurationMinutes: parseInt(editForm.systemDurationMinutes),
          clientDurationMinutes: parseInt(editForm.clientDurationMinutes),
          price: parseFloat(editForm.price),
          categoryId: cat.id,
          category: cat.name,
        },
      });
      setEditId(null);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Помилка збереження');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Видалити послугу? Це також прибере її у всіх майстрів.')) return;
    try {
      await deleteMutation.mutateAsync(serviceId);
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Помилка видалення');
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim() || !addForm.systemDurationMinutes || !addForm.clientDurationMinutes || !addForm.price) {
      setError("Заповніть обов'язкові поля: назва, тривалість, ціна");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: addForm.name.trim(),
        description: addForm.description.trim() || null,
        systemDurationMinutes: parseInt(addForm.systemDurationMinutes),
        clientDurationMinutes: parseInt(addForm.clientDurationMinutes),
        price: parseFloat(addForm.price),
        categoryId: cat.id,
        category: cat.name,
      });
      setAddForm({ ...EMPTY_FORM });
      setShowAdd(false);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Помилка додавання');
    }
  };

  const handleAddDefault = async (ds) => {
    try {
      await createMutation.mutateAsync({
        name: ds.name,
        systemDurationMinutes: ds.systemDurationMinutes,
        clientDurationMinutes: ds.clientDurationMinutes,
        price: ds.suggestedPrice,
        categoryId: cat.id,
        category: cat.name,
      });
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Помилка додавання');
    }
  };

  return (
    <>
      <div style={{ padding: '20px 24px 18px', borderBottom: `1px solid ${peach}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              Категорія послуг
            </div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1E293B' }}>{cat.name}</h3>
            {cat.description && <p style={{ margin: '5px 0 0', fontSize: 13, color: '#64748b' }}>{cat.description}</p>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: `1px solid ${peach}`, borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{error}</p>}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Послуги в салоні ({catServices.length})
          </span>
          {!showAdd && (
            <button onClick={() => setShowAdd(true)} style={{ fontSize: 12, fontWeight: 600, color: accent, background: '#FFF5F0', border: `1px solid ${peach}`, borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}>
              + Додати
            </button>
          )}
        </div>

        {catServices.length === 0 && !showAdd && (
          <div style={{ textAlign: 'center', padding: '28px 0 20px', color: '#94a3b8' }}>
            <Icon name="scissors" size={36} color="#FFD1B3" />
            <p style={{ margin: '10px 0 4px', fontSize: 14, fontWeight: 600, color: '#64748b' }}>Послуг ще немає</p>
            <button onClick={() => setShowAdd(true)} style={{ marginTop: 14, padding: '8px 20px', borderRadius: 9, border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Створити послугу
            </button>
          </div>
        )}

        {catServices.map((svc) => (
          <ServiceRow
            key={svc.id}
            svc={svc}
            isEditing={editId === svc.id}
            form={editForm}
            onChangeForm={(k, v) => setEditForm((prev) => ({ ...prev, [k]: v }))}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setEditId(null)}
            onDelete={handleDelete}
            loading={loading}
          />
        ))}

        {showAdd && (
          <div style={{ background: '#FFF5F0', borderRadius: 12, padding: 16, border: `1px solid ${peach}`, marginBottom: 8 }}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1E293B' }}>Нова послуга</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 10 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <FieldLabel>Назва *</FieldLabel>
                <input style={inputStyle} value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} placeholder="Коригування контуру" />
              </div>
              <div>
                <FieldLabel>Сист. час (хв) *</FieldLabel>
                <input style={inputStyle} type="number" min={15} value={addForm.systemDurationMinutes} onChange={(e) => setAddForm((p) => ({ ...p, systemDurationMinutes: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Клієнт. час (хв) *</FieldLabel>
                <input style={inputStyle} type="number" min={15} value={addForm.clientDurationMinutes} onChange={(e) => setAddForm((p) => ({ ...p, clientDurationMinutes: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Ціна (грн) *</FieldLabel>
                <input style={inputStyle} type="number" min={0} value={addForm.price} onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Опис</FieldLabel>
                <input style={inputStyle} value={addForm.description} onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))} placeholder="необов'язково" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAdd} disabled={loading} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {loading ? '...' : 'Додати'}
              </button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '7px 14px', borderRadius: 7, border: `1px solid ${peach}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>
                Скасувати
              </button>
            </div>
          </div>
        )}

        {suggested.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Стандартні послуги · ще не додані
            </div>
            {suggested.map((ds) => (
              <div key={ds.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: '#fff', border: `1.5px dashed ${peach}`, borderRadius: 10, marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{ds.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{ds.clientDurationMinutes} хв · {ds.suggestedPrice} грн</div>
                </div>
                <button onClick={() => handleAddDefault(ds)} disabled={loading} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${peach}`, background: '#FFF5F0', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: accent, flexShrink: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = accent; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF5F0'; e.currentTarget.style.color = accent; }}
                >+ Додати</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
