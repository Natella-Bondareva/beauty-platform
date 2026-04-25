import React, { useState } from 'react';

const inputStyle = {
  width: '100%', padding: '5px 8px', borderRadius: 6, fontSize: 13,
  border: '1px solid var(--border-color, #ddd)',
  background: 'var(--card-bg, #fff)', color: 'var(--text-color)',
  boxSizing: 'border-box'
};

const selectStyle = {
  width: '100%', padding: '5px 8px', borderRadius: 6, fontSize: 13,
  border: '1px solid var(--border-color, #ddd)',
  background: 'var(--card-bg, #fff)', color: 'var(--text-color)',
  boxSizing: 'border-box', cursor: 'pointer'
};

const EMPTY_ADD_FORM = {
  name: '', categoryId: '', description: '',
  systemDurationMinutes: '', clientDurationMinutes: '', price: ''
};

const fmt = (min) => `${min} хв`;

export default function TeamMemberServicesStep({
  pendingServices,
  onUpdate,
  onRemove,
  onAdd,
  memberCategories,
  currentEmployee,
  onAddAnotherMember,
  addedMembers,
  loading,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);

  if (!currentEmployee) return null;

  // Group pending services by categoryName
  const grouped = {};
  const orderedCategories = [];
  (pendingServices || []).forEach(svc => {
    const cat = svc.categoryName || 'Інше';
    if (!grouped[cat]) {
      grouped[cat] = [];
      orderedCategories.push(cat);
    }
    grouped[cat].push(svc);
  });

  const startEdit = (svc) => {
    setEditingId(svc._id);
    setEditForm({
      name: svc.name,
      categoryId: svc.categoryId,
      description: svc.description || '',
      systemDurationMinutes: svc.systemDurationMinutes,
      clientDurationMinutes: svc.clientDurationMinutes,
      price: svc.price,
    });
  };

  const saveEdit = () => {
    const categoryObj = memberCategories.find(c => c.id === editForm.categoryId || c.id === Number(editForm.categoryId));
    onUpdate(editingId, {
      ...editForm,
      categoryId: editForm.categoryId,
      categoryName: categoryObj?.name || editForm.categoryName,
      systemDurationMinutes: Number(editForm.systemDurationMinutes),
      clientDurationMinutes: Number(editForm.clientDurationMinutes),
      price: Number(editForm.price),
    });
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleAddFormChange = (field, value) => setAddForm(prev => ({ ...prev, [field]: value }));

  const submitAdd = () => {
    if (!addForm.name.trim() || !addForm.systemDurationMinutes || !addForm.clientDurationMinutes || addForm.price === '') return;
    const categoryObj = memberCategories.find(c => c.id === addForm.categoryId || c.id === Number(addForm.categoryId));
    onAdd({
      _id: `custom_${Date.now()}`,
      categoryId: addForm.categoryId || (memberCategories[0]?.id ?? ''),
      categoryName: categoryObj?.name || memberCategories[0]?.name || 'Інше',
      name: addForm.name.trim(),
      description: addForm.description.trim(),
      systemDurationMinutes: Number(addForm.systemDurationMinutes),
      clientDurationMinutes: Number(addForm.clientDurationMinutes),
      price: Number(addForm.price),
    });
    setAddForm(EMPTY_ADD_FORM);
    setShowAddForm(false);
  };

  return (
    <div>
      <h2 className="card-title text-center">Послуги майстра</h2>

      {/* Employee info */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{currentEmployee.fullName}</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
          {memberCategories.map(c => (
            <span key={c.id} style={{
              padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: 'var(--gradient-primary)', border: '1px solid var(--accent-color)'
            }}>{c.name}</span>
          ))}
        </div>
      </div>

      {/* Services grouped by category */}
      {orderedCategories.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary, #888)', marginBottom: 16 }}>
          Послуги відсутні. Додайте послуги вручну.
        </p>
      ) : (
        orderedCategories.map(category => (
          <div key={category} style={{ marginBottom: 20 }}>
            {/* Category header */}
            <div style={{
              padding: '7px 12px',
              background: 'var(--gradient-primary)',
              border: '1px solid var(--border-color, #e0e0e0)',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700, fontSize: 12,
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {category}
            </div>

            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 100px 110px 90px 60px',
              padding: '6px 12px',
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid var(--border-color, #e0e0e0)',
              borderTop: 'none',
              fontSize: 11, fontWeight: 600,
              color: 'var(--text-secondary, #777)',
              textTransform: 'uppercase', letterSpacing: '0.3px'
            }}>
              <span>Послуга</span>
              <span
                title="Системний час — інтервал, на який блокується слот у розкладі майстра (включає підготовку)"
                style={{ cursor: 'help', textDecoration: 'underline dotted' }}
              >Сист. час ⓘ</span>
              <span
                title="Клієнтський час — фактичний час, який отримує клієнт під час послуги"
                style={{ cursor: 'help', textDecoration: 'underline dotted' }}
              >Клієнт. час ⓘ</span>
              <span>Ціна</span>
              <span>Дії</span>
            </div>

            {/* Service rows */}
            <div style={{
              border: '1px solid var(--border-color, #e0e0e0)',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden'
            }}>
              {grouped[category].map((svc, idx) => {
                if (editingId === svc._id) {
                  return (
                    <div key={svc._id} style={{
                      padding: '12px',
                      background: 'var(--gradient-primary, #f9fafb)',
                      borderTop: idx > 0 ? '1px solid var(--border-color, #e0e0e0)' : 'none'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)' }}>Назва *</label>
                          <input
                            style={inputStyle}
                            value={editForm.name}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)' }}>Категорія</label>
                          <select
                            style={selectStyle}
                            value={editForm.categoryId}
                            onChange={e => setEditForm(f => ({ ...f, categoryId: e.target.value }))}
                          >
                            {memberCategories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)', cursor: 'help' }}
                            title="Час, що блокується у розкладі майстра (включає підготовку)">
                            Системний час (хв) * ⓘ
                          </label>
                          <input style={inputStyle} type="number" min={15}
                            value={editForm.systemDurationMinutes}
                            onChange={e => setEditForm(f => ({ ...f, systemDurationMinutes: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)', cursor: 'help' }}
                            title="Час, який бачить клієнт при бронюванні">
                            Клієнтський час (хв) * ⓘ
                          </label>
                          <input style={inputStyle} type="number" min={15}
                            value={editForm.clientDurationMinutes}
                            onChange={e => setEditForm(f => ({ ...f, clientDurationMinutes: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)' }}>Ціна (грн) *</label>
                          <input style={inputStyle} type="number" min={0}
                            value={editForm.price}
                            onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)' }}>Опис</label>
                          <input style={inputStyle}
                            value={editForm.description}
                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="необов'язково"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button type="button" onClick={saveEdit} style={{
                          padding: '5px 16px', borderRadius: 6, border: 'none',
                          background: 'var(--accent-color)', color: '#fff',
                          cursor: 'pointer', fontSize: 13, fontWeight: 600
                        }}>Зберегти</button>
                        <button type="button" onClick={cancelEdit} style={{
                          padding: '5px 14px', borderRadius: 6,
                          border: '1px solid var(--border-color, #ddd)',
                          background: 'transparent', cursor: 'pointer', fontSize: 13
                        }}>Скасувати</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={svc._id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 100px 110px 90px 60px',
                    alignItems: 'center',
                    padding: '9px 12px',
                    gap: 4,
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                    borderTop: idx > 0 ? '1px solid var(--border-color, #f0f0f0)' : 'none'
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{svc.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary, #888)', textAlign: 'center' }}>
                      {fmt(svc.systemDurationMinutes)}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary, #888)', textAlign: 'center' }}>
                      {fmt(svc.clientDurationMinutes)}
                    </span>
                    <span style={{ fontSize: 13 }}>{svc.price} грн</span>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                      <button type="button" title="Редагувати" onClick={() => startEdit(svc)}
                        style={{
                          width: 26, height: 26, border: '1px solid var(--border-color, #ddd)',
                          borderRadius: 5, background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
                        }}>✎</button>
                      <button type="button" title="Видалити" onClick={() => onRemove(svc._id)}
                        style={{
                          width: 26, height: 26, border: '1px solid #fca5a5',
                          borderRadius: 5, background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, color: '#ef4444'
                        }}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Add service form */}
      {!showAddForm ? (
        <button type="button" className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 16 }}
          onClick={() => setShowAddForm(true)}>
          + Додати послугу
        </button>
      ) : (
        <div style={{
          border: '1px solid var(--border-color, #e0e0e0)',
          borderRadius: 10, padding: 16, marginBottom: 16
        }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Нова послуга</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Назва *</label>
              <input className="form-input" value={addForm.name}
                onChange={e => handleAddFormChange('name', e.target.value)}
                placeholder="Манікюр + педикюр" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Категорія</label>
              <select className="form-input" value={addForm.categoryId}
                onChange={e => handleAddFormChange('categoryId', e.target.value)}>
                <option value="">— без категорії —</option>
                {memberCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" title="Час, що блокується у розкладі майстра" style={{ cursor: 'help' }}>
                Системний час (хв) * ⓘ
              </label>
              <input className="form-input" type="number" min={15}
                value={addForm.systemDurationMinutes}
                onChange={e => handleAddFormChange('systemDurationMinutes', e.target.value)}
                placeholder="60" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" title="Час, який бачить клієнт при бронюванні" style={{ cursor: 'help' }}>
                Клієнтський час (хв) * ⓘ
              </label>
              <input className="form-input" type="number" min={15}
                value={addForm.clientDurationMinutes}
                onChange={e => handleAddFormChange('clientDurationMinutes', e.target.value)}
                placeholder="50" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ціна (грн) *</label>
              <input className="form-input" type="number" min={0}
                value={addForm.price}
                onChange={e => handleAddFormChange('price', e.target.value)}
                placeholder="500" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Опис</label>
              <input className="form-input" value={addForm.description}
                onChange={e => handleAddFormChange('description', e.target.value)}
                placeholder="необов'язково" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }}
              onClick={submitAdd}>Додати</button>
            <button type="button" className="btn btn-secondary"
              onClick={() => { setShowAddForm(false); setAddForm(EMPTY_ADD_FORM); }}>
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border-color, #e0e0e0)',
        paddingTop: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          {addedMembers.length > 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #888)' }}>
              Вже додано: <strong>{addedMembers.length}</strong> майстр{addedMembers.length === 1 ? 'а' : 'ів'}
            </p>
          )}
        </div>
        <button type="button" className="btn btn-secondary" onClick={onAddAnotherMember} disabled={loading}>
          + Ще один майстер
        </button>
      </div>
    </div>
  );
}
