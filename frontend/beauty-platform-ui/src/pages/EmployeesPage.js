import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../widgets/DashboardLayout';
import SlidePanel from '../widgets/SlidePanel';
import { EmptyState } from '../shared/ui/EmptyState';
import { useEmployees } from '../features/employees/hooks/useEmployees';
import { useSalonCategories, useSalonServices } from '../features/services/hooks/useSalonServices';
import { useSalonId } from '../shared/hooks/useSalonId';

// Feature components
import CategoryCard from '../features/services/components/CategoryCard';
import CategoryPanel from '../features/services/components/CategoryPanel';
import AddCategoryPanel from '../features/services/components/AddCategoryPanel';
import EmployeeCard from '../features/employees/components/EmployeeCard';
import EmployeePanel from '../features/employees/components/EmployeePanel';
import AddEmployeePanel from '../features/employees/components/AddEmployeePanel';

import Icon from '../components/dashboard/Icon';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const salonId = useSalonId();

  const { data: categories = [], isLoading: catsLoading } = useSalonCategories().activeQuery;
  const { data: categoryTemplates = [] } = useSalonCategories().templatesQuery;
  const { data: employees = [], isLoading: empsLoading } = useEmployees();
  const { data: services = [], isLoading: svcsLoading } = useSalonServices();

  const [panel, setPanel] = useState(null); // { type, data? }

  const closePanel = useCallback(() => setPanel(null), []);

  if (!salonId) {
    navigate('/login');
    return null;
  }

  const loading = catsLoading || empsLoading || svcsLoading;

  const getServiceCountForCategory = (cat) =>
    services.filter(
      (s) =>
        (s.categoryId != null && String(s.categoryId) === String(cat.id)) ||
        s.category?.trim() === cat.name?.trim()
    ).length;

  return (
    <DashboardLayout title="Майстри та послуги">
      <div style={{ padding: '28px 32px', maxWidth: 1180, margin: '0 auto' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              color: '#94a3b8',
            }}
          >
            Завантаження...
          </div>
        ) : (
          <>
            {/* Categories section */}
            <section style={{ marginBottom: 48 }}>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
                  Категорії послуг
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94a3b8' }}>
                  {categories.length} активних категорій · {services.length} послуг у салоні
                </p>
              </div>

              {categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  <Icon name="scissors" size={44} color="#FFD1B3" />
                  <p style={{ marginTop: 12, fontSize: 14 }}>Категорії не знайдено</p>
                  <button
                    onClick={() => setPanel({ type: 'addCategory' })}
                    style={{
                      marginTop: 20,
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'var(--gradient-primary)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    + Додати категорію
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {categories.map((cat, idx) => (
                    <CategoryCard
                      key={cat.id}
                      cat={cat}
                      idx={idx}
                      count={getServiceCountForCategory(cat)}
                      onEdit={() => setPanel({ type: 'category', data: cat })}
                    />
                  ))}
                  <div
                    onClick={() => setPanel({ type: 'addCategory' })}
                    style={{
                      width: 200,
                      height: 148,
                      borderRadius: 18,
                      border: '2px dashed #FFD1B3',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: '#fff',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                  >
                    <div style={{ textAlign: 'center', color: '#D57A66' }}>
                      <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 6 }}>+</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Додати категорію</div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Employees section */}
            <section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
                    Майстри
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94a3b8' }}>
                    {employees.filter((e) => e.isActive).length} активних · {employees.length} всього
                  </p>
                </div>
                <button
                  onClick={() => setPanel({ type: 'addEmployee' })}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: '0 2px 10px rgba(213,122,102,0.3)',
                    marginBottom: 4,
                  }}
                >
                  + Додати майстра
                </button>
              </div>

              {employees.length === 0 ? (
                <EmptyState
                  icon="users"
                  text="Майстрів ще немає"
                  sub="Додайте першого майстра, щоб почати роботу"
                  action="Додати першого майстра"
                  onAction={() => setPanel({ type: 'addEmployee' })}
                />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                    gap: 16,
                  }}
                >
                  {employees.map((emp) => (
                    <EmployeeCard
                      key={emp.id}
                      emp={emp}
                      onEdit={() => setPanel({ type: 'employee', data: emp })}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <SlidePanel open={!!panel} onClose={closePanel}>
        {panel?.type === 'category' && (
          <CategoryPanel cat={panel.data} services={services} onClose={closePanel} />
        )}
        {panel?.type === 'addCategory' && (
          <AddCategoryPanel templates={categoryTemplates} onClose={closePanel} />
        )}
        {panel?.type === 'employee' && (
          <EmployeePanel
            emp={panel.data}
            salonCategories={categories}
            allSalonServices={services}
            onClose={closePanel}
          />
        )}
        {panel?.type === 'addEmployee' && (
          <AddEmployeePanel categories={categories} onClose={closePanel} />
        )}
      </SlidePanel>
    </DashboardLayout>
  );
}
