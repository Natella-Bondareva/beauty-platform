import React from 'react';
import CategoryStep from './CategoryStep';
import TeamMemberFormStep from './TeamMemberFormStep';
import TeamMemberServicesStep from './TeamMemberServicesStep';

const SUB_STEP_LABELS = ['Спеціалізація', 'Дані майстра', 'Послуги'];

export default function AddTeamMemberStep({ teamSubStep, addedMembers, ...props }) {
  return (
    <div>
      {/* Sub-step indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
        {SUB_STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const active = s === teamSubStep;
          const done = s < teamSubStep;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: active || done ? 'var(--accent-color)' : 'var(--secondary-color, #ddd)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700
              }}>
                {done ? '✓' : s}
              </div>
              <span style={{
                fontSize: 11,
                color: active ? 'var(--accent-color)' : 'var(--text-secondary, #999)',
                fontWeight: active ? 600 : 400
              }}>{label}</span>
              {i < SUB_STEP_LABELS.length - 1 && (
                <div style={{ width: 20, height: 2, background: done ? 'var(--accent-color)' : 'var(--secondary-color, #ddd)', marginLeft: 4 }} />
              )}
            </div>
          );
        })}
      </div>

      {addedMembers.length > 0 && teamSubStep === 1 && (
        <div style={{
          background: 'var(--gradient-primary)',
          border: '1px solid var(--accent-color)',
          borderRadius: 8,
          padding: '8px 14px',
          marginBottom: 16,
          fontSize: 13,
          textAlign: 'center'
        }}>
          Вже додано: {addedMembers.map(m => m.fullName).join(', ')}
        </div>
      )}

      {teamSubStep === 1 && (
        <CategoryStep
          categories={props.categories}
          selectedCategories={props.memberCategories}
          setSelectedCategories={props.setMemberCategories}
        />
      )}

      {teamSubStep === 2 && (
        <TeamMemberFormStep
          selectedCategories={props.memberCategories}
          form={props.memberForm}
          onFormChange={props.onMemberFormChange}
          yearsExperience={props.memberYears}
          setYearsExperience={props.setMemberYears}
          createAccount={props.memberCreateAccount}
          setCreateAccount={props.setMemberCreateAccount}
          accountEmail={props.memberAccountEmail}
          setAccountEmail={props.setMemberAccountEmail}
          accountPassword={props.memberAccountPassword}
          setAccountPassword={props.setMemberAccountPassword}
        />
      )}

      {teamSubStep === 3 && (
        <TeamMemberServicesStep
          currentEmployee={props.currentEmployee}
          pendingServices={props.pendingServices}
          onUpdate={props.onUpdatePendingService}
          onRemove={props.onRemovePendingService}
          onAdd={props.onAddPendingService}
          memberCategories={props.memberCategories}
          onAddAnotherMember={props.onAddAnotherMember}
          addedMembers={addedMembers}
          loading={props.loading}
        />
      )}
    </div>
  );
}
