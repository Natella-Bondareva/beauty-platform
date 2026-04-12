import React from 'react';
import OwnerInfoStep from '../components/registration/OwnerInfoStep';
import SalonInfoStep from '../components/registration/SalonInfoStep';
import SalonSettingsStep from '../components/registration/SalonSettingsStep';
import DaysOffStep from '../components/registration/DaysOffStep';
import WorkTypeStep from '../components/registration/WorkTypeStep';
import WelcomeStep from '../components/registration/WelcomeStep';
import { useRegistration } from '../hooks/useRegistration';

export default function Register() {
  const {
    step,
    formData,
    settings,
    workType,
    setWorkType,
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
    handleNext,
    handlePrev,
    handleSubmit
  } = useRegistration();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OwnerInfoStep formData={formData} handleChange={handleChange} />;
      case 2:
        return <SalonInfoStep formData={formData} handleChange={handleChange} />;
      case 3:
        return <SalonSettingsStep settings={settings} handleSettingsChange={handleSettingsChange} adjustTime={adjustTime} adjustDuration={adjustDuration} />;
      case 4:
        return <DaysOffStep
          regularDaysOff={regularDaysOff}
          specialDaysOff={specialDaysOff}
          newSpecialDate={newSpecialDate}
          newSpecialReason={newSpecialReason}
          setNewSpecialDate={setNewSpecialDate}
          setNewSpecialReason={setNewSpecialReason}
          handleRegularDayOffChange={handleRegularDayOffChange}
          addSpecialDayOff={addSpecialDayOff}
          removeSpecialDayOff={removeSpecialDayOff}
        />;
      case 5:
        return <WorkTypeStep workType={workType} setWorkType={setWorkType} />;
      case 6:
        return <WelcomeStep />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-center" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Circles */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        left: '-40%',
        width: '180%',
        height: '180%',
        background: 'var(--gradient-circle)',
        borderRadius: 'var(--border-radius-full)',
        zIndex: -1
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-20%',
        width: '40%',
        height: '40%',
        background: 'var(--gradient-accent)',
        borderRadius: 'var(--border-radius-full)',
        zIndex: -1
      }}></div>

      <div className="card fade-in" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-lg)' }}>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                style={{
                  width: '40px',
                  height: '8px',
                  background: s <= step ? 'var(--accent-color)' : 'var(--secondary-color)',
                  margin: '0 4px',
                  borderRadius: '4px',
                  transition: 'background 0.3s ease'
                }}
              ></div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          {error && <p className="form-error">{error}</p>}

          <div className="flex flex-between" style={{ marginTop: 'var(--spacing-xl)' }}>
            {step > 1 && step < 6 && (
              <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                Previous
              </button>
            )}
            <div></div> {/* Spacer */}
            {step < 6 ? (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Next'}
              </button>
            ) : (
              <button type="submit" className="btn btn-primary">
                Get Started
              </button>
            )}
          </div>
        </form>

        {step === 1 && (
          <p className="text-center mt-lg text-secondary">
            Already have an account? <a href="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Sign in</a>
          </p>
        )}
      </div>
    </div>
  );
}