import React from 'react';
import OwnerInfoStep from '../components/registration/OwnerInfoStep';
import SalonInfoStep from '../components/registration/SalonInfoStep';
import SalonSettingsStep from '../components/registration/SalonSettingsStep';
import DaysOffStep from '../components/registration/DaysOffStep';
import WorkTypeStep from '../components/registration/WorkTypeStep';
import CategoryStep from '../components/registration/CategoryStep';
import SelfRegStep from '../components/registration/SelfRegStep';
import AddTeamMemberStep from '../components/registration/AddTeamMemberStep';
import WelcomeStep from '../components/registration/WelcomeStep';
import { useRegistration } from '../hooks/useRegistration';

export default function Register() {
  const {
    step,
    formData,
    settings,
    workType,
    setWorkType,
    categories,
    selectedCategories,
    setSelectedCategories,
    yearsExperience,
    setYearsExperience,
    // Team wizard
    teamSubStep,
    addedMembers,
    memberCategories,
    setMemberCategories,
    memberForm,
    onMemberFormChange,
    memberYears,
    setMemberYears,
    memberCreateAccount,
    setMemberCreateAccount,
    memberAccountEmail,
    setMemberAccountEmail,
    memberAccountPassword,
    setMemberAccountPassword,
    currentEmployee,
    salonServicesList,
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
    // Shared
    error,
    loading,
    regularDaysOff,
    specialDaysOff,
    newSpecialDate,
    newSpecialReason,
    setNewSpecialDate,
    setNewSpecialReason,
    handleChange,
    handleSettingsChange,
    adjustTime,
    adjustDuration,
    handleRegularDayOffChange,
    addSpecialDayOff,
    removeSpecialDayOff,
    handlePrev,
    handleSubmit,
    getTotalSteps,
    getWelcomeStep
  } = useRegistration();

  const totalSteps = getTotalSteps();
  const welcomeStep = getWelcomeStep();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OwnerInfoStep formData={formData} handleChange={handleChange} />;
      case 2:
        return <SalonInfoStep formData={formData} handleChange={handleChange} />;
      case 3:
        return <SalonSettingsStep settings={settings} handleSettingsChange={handleSettingsChange} adjustTime={adjustTime} adjustDuration={adjustDuration} />;
      case 4:
        return (
          <DaysOffStep
            regularDaysOff={regularDaysOff}
            specialDaysOff={specialDaysOff}
            newSpecialDate={newSpecialDate}
            newSpecialReason={newSpecialReason}
            setNewSpecialDate={setNewSpecialDate}
            setNewSpecialReason={setNewSpecialReason}
            handleRegularDayOffChange={handleRegularDayOffChange}
            addSpecialDayOff={addSpecialDayOff}
            removeSpecialDayOff={removeSpecialDayOff}
          />
        );
      case 5:
        return <WorkTypeStep workType={workType} setWorkType={setWorkType} />;
      case 6:
        if (workType === 'team') {
          return (
            <AddTeamMemberStep
              teamSubStep={teamSubStep}
              addedMembers={addedMembers}
              categories={categories}
              memberCategories={memberCategories}
              setMemberCategories={setMemberCategories}
              memberForm={memberForm}
              onMemberFormChange={onMemberFormChange}
              memberYears={memberYears}
              setMemberYears={setMemberYears}
              memberCreateAccount={memberCreateAccount}
              setMemberCreateAccount={setMemberCreateAccount}
              memberAccountEmail={memberAccountEmail}
              setMemberAccountEmail={setMemberAccountEmail}
              memberAccountPassword={memberAccountPassword}
              setMemberAccountPassword={setMemberAccountPassword}
              currentEmployee={currentEmployee}
              salonServicesList={salonServicesList}
              editingServiceId={editingServiceId}
              editingServiceForm={editingServiceForm}
              onStartEditService={onStartEditService}
              onEditingServiceFormChange={onEditingServiceFormChange}
              onSaveEditService={onSaveEditService}
              onCancelEditService={onCancelEditService}
              onRemoveService={onRemoveService}
              showAddServiceForm={showAddServiceForm}
              setShowAddServiceForm={setShowAddServiceForm}
              customServiceForm={customServiceForm}
              onCustomServiceFormChange={onCustomServiceFormChange}
              onAddCustomService={onAddCustomService}
              onAddAnotherMember={onAddAnotherMember}
              loading={loading}
            />
          );
        }
        return (
          <CategoryStep
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        );
      case 7:
        if (workType === 'team') {
          return <WelcomeStep />;
        }
        return (
          <SelfRegStep
            yearsExperience={yearsExperience}
            setYearsExperience={setYearsExperience}
            workType={workType}
            selectedCategories={selectedCategories}
          />
        );
      case 8:
        if (workType === 'me_and_team') {
          return (
            <AddTeamMemberStep
              teamSubStep={teamSubStep}
              addedMembers={addedMembers}
              categories={categories}
              memberCategories={memberCategories}
              setMemberCategories={setMemberCategories}
              memberForm={memberForm}
              onMemberFormChange={onMemberFormChange}
              memberYears={memberYears}
              setMemberYears={setMemberYears}
              memberCreateAccount={memberCreateAccount}
              setMemberCreateAccount={setMemberCreateAccount}
              memberAccountEmail={memberAccountEmail}
              setMemberAccountEmail={setMemberAccountEmail}
              memberAccountPassword={memberAccountPassword}
              setMemberAccountPassword={setMemberAccountPassword}
              currentEmployee={currentEmployee}
              salonServicesList={salonServicesList}
              editingServiceId={editingServiceId}
              editingServiceForm={editingServiceForm}
              onStartEditService={onStartEditService}
              onEditingServiceFormChange={onEditingServiceFormChange}
              onSaveEditService={onSaveEditService}
              onCancelEditService={onCancelEditService}
              onRemoveService={onRemoveService}
              showAddServiceForm={showAddServiceForm}
              setShowAddServiceForm={setShowAddServiceForm}
              customServiceForm={customServiceForm}
              onCustomServiceFormChange={onCustomServiceFormChange}
              onAddCustomService={onAddCustomService}
              onAddAnotherMember={onAddAnotherMember}
              loading={loading}
            />
          );
        }
        return <WelcomeStep />; // solo
      case 9:
        return <WelcomeStep />; // me_and_team
      default:
        return null;
    }
  };

  const isWelcomeStep = step === welcomeStep;
  const isTeamMemberStep = step === 8 && workType === 'me_and_team';
  const isServicesSubStep = teamSubStep === 3 && (
    (step === 6 && workType === 'team') ||
    (step === 8 && workType === 'me_and_team')
  );

  const nextButtonLabel = () => {
    if (isWelcomeStep) return 'Get Started';
    if (isTeamMemberStep) return 'Готово';
    if (loading) return 'Processing...';
    return 'Next';
  };

  return (
    <div className="flex flex-center" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background circles */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        left: '-40%',
        width: '180%',
        height: '180%',
        background: 'var(--gradient-circle)',
        borderRadius: 'var(--border-radius-full)',
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-20%',
        width: '40%',
        height: '40%',
        background: 'var(--gradient-accent)',
        borderRadius: 'var(--border-radius-full)',
        zIndex: -1
      }} />

      <div className="card fade-in" style={{ width: '100%', maxWidth: isServicesSubStep ? '760px' : '520px', transition: 'max-width 0.25s ease' }}>
        <div className="card-header">
          {/* Progress bar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-lg)', gap: 4 }}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '6px',
                  background: s <= step ? 'var(--accent-color)' : 'var(--secondary-color)',
                  borderRadius: '3px',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          {error && <p className="form-error">{error}</p>}

          <div className="flex flex-between" style={{ marginTop: 'var(--spacing-xl)' }}>
            {step > 1 && step < welcomeStep && (
              <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                Previous
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading && !isWelcomeStep}
            >
              {nextButtonLabel()}
            </button>
          </div>
        </form>

        {step === 1 && (
          <p className="text-center mt-lg text-secondary">
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Sign in</a>
          </p>
        )}
      </div>
    </div>
  );
}
