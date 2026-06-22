import OwnerInfoStep from '../components/registration/OwnerInfoStep';
import SalonInfoStep from '../components/registration/SalonInfoStep';
import SalonSettingsStep from '../components/registration/SalonSettingsStep';
import DaysOffStep from '../components/registration/DaysOffStep';
import WorkTypeStep from '../components/registration/WorkTypeStep';
import AddTeamMemberStep from '../components/registration/AddTeamMemberStep';
import SubscriptionModulesStep from '../components/registration/SubscriptionModulesStep';
import SubscriptionSummaryStep from '../components/registration/SubscriptionSummaryStep';
import { useRegistration } from '../features/registration/hooks/useRegistration';

export default function Register() {
  const {
    step,
    formData,
    settings,
    workType,
    setWorkType,
    categories,
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
    pendingServices,
    onUpdatePendingService,
    onRemovePendingService,
    onAddPendingService,
    onAddAnotherMember,
    // Subscription
    subConfig,
    subConfigLoading,
    subSelectedModules,
    toggleSubModule,
    subMonths,
    setSubMonths,
    subExtraMasters,
    subTotalPrice,
    getSummaryStep,
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
  } = useRegistration();

  const totalSteps = getTotalSteps();
  const summaryStep = getSummaryStep();

  const isTeamStep = step === 7 && (workType === 'team' || workType === 'me_and_team');
  const isServicesSubStep = teamSubStep === 3 && isTeamStep;
  const isSummaryStep = step === summaryStep;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OwnerInfoStep formData={formData} handleChange={handleChange} />;
      case 2:
        return <SalonInfoStep formData={formData} handleChange={handleChange} />;
      case 3:
        return (
          <SalonSettingsStep
            settings={settings}
            handleSettingsChange={handleSettingsChange}
            adjustTime={adjustTime}
            adjustDuration={adjustDuration}
          />
        );
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
        return (
          <SubscriptionModulesStep
            config={subConfig}
            configLoading={subConfigLoading}
            selectedModules={subSelectedModules}
            toggleModule={toggleSubModule}
            months={subMonths}
            setMonths={setSubMonths}
            totalPrice={subTotalPrice}
          />
        );
      case 6:
        return <WorkTypeStep workType={workType} setWorkType={setWorkType} />;
      case 7:
        if (workType === 'team' || workType === 'me_and_team') {
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
              pendingServices={pendingServices}
              onUpdatePendingService={onUpdatePendingService}
              onRemovePendingService={onRemovePendingService}
              onAddPendingService={onAddPendingService}
              onAddAnotherMember={onAddAnotherMember}
              loading={loading}
            />
          );
        }
        // solo: step 7 is the summary
        return (
          <SubscriptionSummaryStep
            config={subConfig}
            selectedModules={subSelectedModules}
            extraMasters={subExtraMasters}
            months={subMonths}
          />
        );
      case 8:
        // team / me_and_team: step 8 is the summary
        return (
          <SubscriptionSummaryStep
            config={subConfig}
            selectedModules={subSelectedModules}
            extraMasters={subExtraMasters}
            months={subMonths}
          />
        );
      default:
        return null;
    }
  };

  const nextButtonLabel = () => {
    if (isSummaryStep) return 'Пропустити';
    if (loading) return 'Завантаження...';
    return 'Далі';
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
            {step > 1 && step < summaryStep && (
              <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                Назад
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading && !isSummaryStep}
            >
              {nextButtonLabel()}
            </button>
          </div>
        </form>

        {step === 1 && (
          <p className="text-center mt-lg text-secondary">
            Вже маєте акаунт?{' '}
            <a href="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Увійти</a>
          </p>
        )}
      </div>
    </div>
  );
}
