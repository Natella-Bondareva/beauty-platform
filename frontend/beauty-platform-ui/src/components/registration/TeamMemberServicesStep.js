import React from 'react';

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

export default function TeamMemberServicesStep({
  employee,
  salonServices,
  editingServiceId,
  editingServiceForm,
  onStartEditService,
  onEditingServiceFormChange,
  onSaveEditService,
  onCancelEditService,
  onRemoveService,
  showAddServiceForm,
  setShowAddServiceForm,
  customServiceForm,
  onCustomServiceFormChange,
  onAddCustomService,
  onAddAnotherMember,
  addedMembers,
  loading,
}) {
  if (!employee) return null;

  // Category names from the master's selected specializations
  const masterCategoryNames = (employee.categories || []).map(c => c.name);

  // Group employee services by the service's own category field (cross-ref with salonServices)
  const grouped = {};
  const orderedCategories = [];
  employee.services.forEach(empSvc => {
    const full = salonServices.find(s => s.id === empSvc.serviceId);
    const cat = full?.category?.trim() || 'Інше';
    if (!grouped[cat]) {
      grouped[cat] = [];
      orderedCategories.push(cat);
    }
    grouped[cat].push({ empSvc, full });
  });

  const fmt = (min) => `${min} хв`;

  return (
    <div>
      <h2 className="card-title text-center">Послуги майстра</h2>

      {/* Employee info */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{employee.fullName}</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
          {employee.categories?.map(c => (
            <span key={c.id} style={{
              padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: 'var(--gradient-primary)', border: '1px solid var(--accent-color)'
            }}>{c.name}</span>
          ))}
        </div>
      </div>

      {/* Services grouped by category */}
      {employee.services.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary, #888)', marginBottom: 16 }}>
          Послуги не знайдено. Додайте послуги вручну.
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
              >
                Сист. час ⓘ
              </span>
              <span
                title="Клієнтський час — фактичний час, який отримує клієнт під час послуги"
                style={{ cursor: 'help', textDecoration: 'underline dotted' }}
              >
                Клієнт. час ⓘ
              </span>
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
              {grouped[category].map(({ empSvc, full }, idx) => {
                const isEditing = editingServiceId === empSvc.serviceId;

                if (isEditing) {
                  return (
                    <div key={empSvc.serviceId} style={{
                      padding: '12px',
                      background: 'var(--gradient-primary, #f9fafb)',
                      borderTop: idx > 0 ? '1px solid var(--border-color, #e0e0e0)' : 'none'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)' }}>Назва *</label>
                          <input
                            style={inputStyle}
                            value={editingServiceForm.name}
                            onChange={e => onEditingServiceFormChange('name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)' }}>Категорія</label>
                          <select
                            style={selectStyle}
                            value={editingServiceForm.category}
                            onChange={e => onEditingServiceFormChange('category', e.target.value)}
                          >
                            <option value="">— без категорії —</option>
                            {masterCategoryNames.map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)', cursor: 'help' }}
                            title="Час, що блокується у розкладі майстра (включає підготовку)"
                          >
                            Системний час (хв) *
                          </label>
                          <input
                            style={inputStyle}
                            type="number" min={15}
                            value={editingServiceForm.systemDurationMinutes}
                            onChange={e => onEditingServiceFormChange('systemDurationMinutes', e.target.value)}
                          />
                        </div>
                        <div>
                          <label
                            style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)', cursor: 'help' }}
                            title="Час, який бачить клієнт при бронюванні"
                          >
                            Клієнтський час (хв) *
                          </label>
                          <input
                            style={inputStyle}
                            type="number" min={15}
                            value={editingServiceForm.clientDurationMinutes}
                            onChange={e => onEditingServiceFormChange('clientDurationMinutes', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)' }}>Ціна (грн) *</label>
                          <input
                            style={inputStyle}
                            type="number" min={0}
                            value={editingServiceForm.price}
                            onChange={e => onEditingServiceFormChange('price', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #888)' }}>Опис</label>
                          <input
                            style={inputStyle}
                            value={editingServiceForm.description}
                            onChange={e => onEditingServiceFormChange('description', e.target.value)}
                            placeholder="необов'язково"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button
                          type="button"
                          onClick={onSaveEditService}
                          disabled={loading}
                          style={{
                            padding: '5px 16px', borderRadius: 6, border: 'none',
                            background: 'var(--accent-color)', color: '#fff',
                            cursor: 'pointer', fontSize: 13, fontWeight: 600
                          }}
                        >
                          {loading ? '...' : 'Зберегти'}
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEditService}
                          style={{
                            padding: '5px 14px', borderRadius: 6,
                            border: '1px solid var(--border-color, #ddd)',
                            background: 'transparent', cursor: 'pointer', fontSize: 13
                          }}
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={empSvc.serviceId}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 100px 110px 90px 60px',
                      alignItems: 'center',
                      padding: '9px 12px',
                      gap: 4,
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                      borderTop: idx > 0 ? '1px solid var(--border-color, #f0f0f0)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{empSvc.serviceName}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary, #888)', textAlign: 'center' }}>
                      {fmt(empSvc.systemDurationMinutes)}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary, #888)', textAlign: 'center' }}>
                      {fmt(empSvc.clientDurationMinutes)}
                    </span>
                    <span style={{ fontSize: 13 }}>
                      {empSvc.effectivePrice} грн
                      {empSvc.priceOverride != null && (
                        <span style={{ fontSize: 10, color: 'var(--accent-color)', marginLeft: 3 }}>*</span>
                      )}
                    </span>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        title="Редагувати послугу"
                        onClick={() => onStartEditService(empSvc, full)}
                        style={{
                          width: 26, height: 26, border: '1px solid var(--border-color, #ddd)',
                          borderRadius: 5, background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
                        }}
                      >✎</button>
                      <button
                        type="button"
                        title="Видалити послугу"
                        onClick={() => onRemoveService(empSvc.serviceId)}
                        style={{
                          width: 26, height: 26, border: '1px solid #fca5a5',
                          borderRadius: 5, background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, color: '#ef4444'
                        }}
                      >✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Add custom service */}
      {!showAddServiceForm ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 16 }}
          onClick={() => setShowAddServiceForm(true)}
        >
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
              <input className="form-input" name="name" value={customServiceForm.name}
                onChange={onCustomServiceFormChange} placeholder="Манікюр + педикюр" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Категорія</label>
              <select
                className="form-input"
                name="category"
                value={customServiceForm.category}
                onChange={onCustomServiceFormChange}
              >
                <option value="">— без категорії —</option>
                {masterCategoryNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" title="Час, що блокується у розкладі майстра" style={{ cursor: 'help' }}>
                Системний час (хв) * ⓘ
              </label>
              <input className="form-input" name="systemDurationMinutes" type="number" min={15}
                value={customServiceForm.systemDurationMinutes}
                onChange={onCustomServiceFormChange} placeholder="170" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" title="Час, який бачить клієнт при бронюванні" style={{ cursor: 'help' }}>
                Клієнтський час (хв) * ⓘ
              </label>
              <input className="form-input" name="clientDurationMinutes" type="number" min={15}
                value={customServiceForm.clientDurationMinutes}
                onChange={onCustomServiceFormChange} placeholder="140" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ціна (грн) *</label>
              <input className="form-input" name="price" type="number" min={0}
                value={customServiceForm.price}
                onChange={onCustomServiceFormChange} placeholder="800" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Опис</label>
              <input className="form-input" name="description" value={customServiceForm.description}
                onChange={onCustomServiceFormChange} placeholder="необов'язково" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }}
              onClick={onAddCustomService} disabled={loading}>
              {loading ? 'Збереження...' : 'Додати'}
            </button>
            <button type="button" className="btn btn-secondary"
              onClick={() => setShowAddServiceForm(false)}>
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
