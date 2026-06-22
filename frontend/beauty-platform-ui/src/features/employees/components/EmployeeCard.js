import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '../../../shared/ui/Avatar';
import { accent, peach } from '../../../shared/ui/tokens';
import { employeeApi } from '../api/employee.api';

export default function EmployeeCard({ emp, salonId, onEdit }) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['employees', salonId] });

  const activateMut = useMutation({
    mutationFn: () => employeeApi.activate(salonId, emp.id),
    onSuccess: invalidate,
  });
  const deactivateMut = useMutation({
    mutationFn: () => employeeApi.deactivate(salonId, emp.id),
    onSuccess: invalidate,
  });
  const archiveMut = useMutation({
    mutationFn: () => employeeApi.archive(salonId, emp.id),
    onSuccess: invalidate,
  });
  const unarchiveMut = useMutation({
    mutationFn: () => employeeApi.unarchive(salonId, emp.id),
    onSuccess: invalidate,
  });
  const deleteMut = useMutation({
    mutationFn: () => employeeApi.delete(salonId, emp.id),
    onSuccess: invalidate,
  });

  const busy = activateMut.isPending || deactivateMut.isPending || archiveMut.isPending || unarchiveMut.isPending || deleteMut.isPending;

  const statusDot = emp.isArchived
    ? { bg: '#f59e0b', title: 'Архів' }
    : emp.isActive
      ? { bg: '#22c55e', title: 'Активний' }
      : { bg: '#94a3b8', title: 'Неактивний' };

  const isAdmin = emp.role === 'Admin' || emp.role === 'Administrator' || emp.isAdmin === true;

  return (
    <div
      style={{
        background: emp.isArchived ? '#fafafa' : '#fff',
        borderRadius: 18,
        border: `1px solid ${emp.isArchived ? '#e2e8f0' : peach}`,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        position: 'relative',
        opacity: emp.isArchived ? 0.7 : 1,
        transition: 'box-shadow 0.15s,transform 0.15s',
      }}
      onMouseEnter={(e) => {
        if (emp.isArchived) return;
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(213,122,102,0.14)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Status dot */}
      <div
        style={{
          position: 'absolute', top: 12, right: 12,
          width: 9, height: 9, borderRadius: '50%',
          background: statusDot.bg,
          boxShadow: emp.isActive && !emp.isArchived ? '0 0 0 2.5px rgba(34,197,94,0.2)' : 'none',
        }}
        title={statusDot.title}
      />

      {emp.isArchived && (
        <div style={{
          position: 'absolute', top: 10, left: 12,
          fontSize: 10, fontWeight: 600, color: '#94a3b8',
          background: '#f1f5f9', borderRadius: 6, padding: '1px 7px',
        }}>
          АРХІВ
        </div>
      )}

      <Avatar name={emp.fullName} avatarUrl={emp.avatarUrl} size={60} />

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>{emp.fullName}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
          {isAdmin && (
            <span style={{ padding: '4px 10px', borderRadius: 999, background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700 }}>
              Адміністратор
            </span>
          )}
          {emp.phone && <span style={{ fontSize: 12, color: '#94a3b8' }}>{emp.phone}</span>}
        </div>
      </div>

      {emp.categories?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {emp.categories.map((c) => (
            <span
              key={c.id}
              style={{
                padding: '2px 8px', borderRadius: 10,
                fontSize: 11, fontWeight: 500,
                background: '#FFF5F0', color: accent, border: `1px solid ${peach}`,
              }}
            >
              {c.name}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 10 }}>
        <span>{emp.servicesCount ?? 0} послуг</span>
        {emp.hasUserAccount && (
          <span title="Має обліковий запис" style={{ color: '#a78bfa' }}>🔑 акаунт</span>
        )}
      </div>

      {/* Edit button */}
      {!emp.isArchived && (
        <button
          onClick={onEdit}
          style={{
            width: '100%', padding: '7px', borderRadius: 8, marginTop: 4,
            border: `1px solid ${peach}`, background: '#fff', cursor: 'pointer',
            fontSize: 13, color: '#64748b', fontWeight: 500, transition: 'all 0.14s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF5F0'; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = peach; }}
        >
          Редагувати
        </button>
      )}

      {/* Status actions */}
      <div style={{ display: 'flex', gap: 6, width: '100%', flexWrap: 'wrap' }}>
        {!emp.isArchived && (
          emp.isActive ? (
            <ActionBtn
              label="Деактивувати"
              color="#64748b"
              border="#e2e8f0"
              bg="#f8fafc"
              disabled={busy}
              onClick={() => deactivateMut.mutate()}
            />
          ) : (
            <ActionBtn
              label="Активувати"
              color="#22c55e"
              border="#bbf7d0"
              bg="#f0fdf4"
              disabled={busy}
              onClick={() => activateMut.mutate()}
            />
          )
        )}

        {emp.isArchived ? (
          <ActionBtn
            label="З архіву"
            color="#f59e0b"
            border="#fde68a"
            bg="#fffbeb"
            disabled={busy}
            onClick={() => unarchiveMut.mutate()}
          />
        ) : (
          <ActionBtn
            label="Архів"
            color="#94a3b8"
            border="#e2e8f0"
            bg="#f8fafc"
            disabled={busy}
            onClick={() => archiveMut.mutate()}
          />
        )}

        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 4, width: '100%' }}>
            <ActionBtn
              label="Підтвердити видалення"
              color="#ef4444"
              border="#fecaca"
              bg="#fef2f2"
              disabled={busy}
              onClick={() => deleteMut.mutate()}
              flex={1}
            />
            <ActionBtn
              label="Скасувати"
              color="#64748b"
              border="#e2e8f0"
              bg="#f8fafc"
              disabled={busy}
              onClick={() => setConfirmDelete(false)}
            />
          </div>
        ) : (
          <ActionBtn
            label="Видалити"
            color="#ef4444"
            border="#fecaca"
            bg="#fef2f2"
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
          />
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, border, bg, disabled, onClick, flex }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: flex ?? 'initial',
        padding: '5px 10px',
        borderRadius: 8,
        border: `1px solid ${border}`,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
