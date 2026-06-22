import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBookingWizard } from '../features/booking/hooks/useBookingWizard';
import StepServices from '../features/booking/components/StepServices';
import StepEmployee from '../features/booking/components/StepEmployee';
import StepDateTime from '../features/booking/components/StepDateTime';
import StepContact from '../features/booking/components/StepContact';
import StepBookingFields from '../features/booking/components/StepBookingFields';
import StepConfirm from '../features/booking/components/StepConfirm';
import StepVerify from '../features/booking/components/StepVerify';
import ClientHistoryModal from '../features/booking/components/ClientHistoryModal';
import Icon from '../components/dashboard/Icon';

const accent = '#D57A66';
const peach = '#FFD1B3';
const bg = '#FFF5F0';

// Кроки без "Деталі" (якщо немає bookingFields) — завжди містять Верифікацію
const LABELS_SHORT = ['Послуга', 'Майстер', 'Час', 'Контакти', 'Підтвердження', 'SMS-код'];
const LABELS_FULL  = ['Послуга', 'Майстер', 'Час', 'Контакти', 'Деталі', 'Підтвердження', 'SMS-код'];

function ProgressBar({ step, hasFields }) {
  const labels = hasFields ? LABELS_FULL : LABELS_SHORT;
  // Маппінг wizard-step (1-7) на індекс у labels
  // Без полів: wizard 6→idx 4, wizard 7→idx 5
  // З полями:  wizard 5→idx 4, wizard 6→idx 5, wizard 7→idx 6
  const labelIndex = hasFields ? step - 1 : (step >= 6 ? step - 2 : step - 1);
  const currentLabel = labels[Math.min(labelIndex, labels.length - 1)] ?? '';

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
        {labels.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 4,
              background: i <= labelIndex ? accent : '#e2e8f0',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
        <span style={{ fontWeight: 600, color: accent }}>{currentLabel}</span>
        <span>Крок {labelIndex + 1} з {labels.length}</span>
      </div>
    </div>
  );
}

function SuccessScreen({ onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#f0fdf4',
          border: '2px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <Icon name="checkCircle" size={36} color="#22c55e" />
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>
        Запис підтверджено!
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 32 }}>
        Ваш запис успішно створено.
        <br />
        Чекаємо на вас!
      </div>
      <button
        onClick={onReset}
        style={{
          padding: '11px 28px',
          borderRadius: 12,
          border: `1.5px solid ${peach}`,
          background: '#fff',
          color: accent,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        Зробити ще один запис
      </button>
    </div>
  );
}

export default function BookingPage() {
  const { salonId } = useParams();
  const [confirmed, setConfirmed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const wizard = useBookingWizard(salonId);

  if (!salonId) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          color: '#94a3b8',
          fontSize: 14,
        }}
      >
        Невірне посилання на форму запису
      </div>
    );
  }

  const canGoBack = wizard.step > 1 && wizard.step < 7 && !confirmed;

  const renderStep = () => {
    if (confirmed) {
      return (
        <SuccessScreen
          onReset={() => {
            setConfirmed(false);
            wizard.reset();
          }}
        />
      );
    }

    switch (wizard.step) {
      case 1:
        return (
          <StepServices
            salonId={salonId}
            onSelect={wizard.selectService}
          />
        );
      case 2:
        return (
          <StepEmployee
            salonId={salonId}
            selectedService={wizard.selectedService}
            onSelect={wizard.selectEmployee}
          />
        );
      case 3:
        return (
          <StepDateTime
            salonId={salonId}
            selectedService={wizard.selectedService}
            selectedEmployee={wizard.selectedEmployee}
            onSelect={wizard.selectSlot}
          />
        );
      case 4:
        return (
          <StepContact
            selectedService={wizard.selectedService}
            selectedSlot={wizard.selectedSlot}
            contact={wizard.contact}
            onChange={wizard.setContact}
            onNext={wizard.advanceToConfirm}
            loading={wizard.fieldsLoading}
          />
        );
      case 5:
        return (
          <StepBookingFields
            bookingFields={wizard.bookingFields}
            fieldAnswers={wizard.fieldAnswers}
            onAnswer={wizard.setFieldAnswer}
            onNext={wizard.advanceFromFields}
            totalSteps={wizard.totalSteps}
          />
        );
      case 6:
        return (
          <StepConfirm
            salonId={salonId}
            selectedService={wizard.selectedService}
            selectedEmployee={wizard.selectedEmployee}
            selectedSlot={wizard.selectedSlot}
            contact={wizard.contact}
            fieldAnswers={wizard.fieldAnswers}
            onSuccess={wizard.setBookingResult}
          />
        );
      case 7:
        return (
          <StepVerify
            bookingId={wizard.bookingId}
            expiresAt={wizard.expiresAt}
            onSuccess={() => setConfirmed(true)}
            onExpired={wizard.reset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          height: 60,
          background: '#fff',
          borderBottom: `1px solid ${peach}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
          boxShadow: '0 1px 8px rgba(213,122,102,0.07)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          BP
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Beauty Platform</span>
        <span
          style={{
            marginLeft: 8,
            fontSize: 12,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 20,
            background: '#FFF5F0',
            color: accent,
            border: `1px solid ${peach}`,
          }}
        >
          Онлайн-запис
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowHistory(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 20,
            border: `1px solid ${peach}`,
            background: '#fff',
            color: accent,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF5F0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
        >
          <Icon name="calendar" size={14} color={accent} />
          Мої записи
        </button>
      </header>

      {showHistory && (
        <ClientHistoryModal
          salonId={salonId}
          onClose={() => setShowHistory(false)}
          onRepeat={() => {
            wizard.reset();
          }}
        />
      )}

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: '32px 16px 48px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 600,
            background: '#fff',
            borderRadius: 20,
            border: `1px solid ${peach}`,
            boxShadow: '0 4px 24px rgba(213,122,102,0.09)',
            padding: '28px 28px 32px',
          }}
        >
          {/* Back button */}
          {canGoBack && (
            <button
              onClick={wizard.goBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: 13,
                fontWeight: 500,
                padding: '0 0 16px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <Icon name="chevronLeft" size={16} color="currentColor" />
              Назад
            </button>
          )}

          {/* Progress */}
          {!confirmed && (
            <ProgressBar step={wizard.step} hasFields={wizard.bookingFields?.length > 0} />
          )}

          {/* Step content */}
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
