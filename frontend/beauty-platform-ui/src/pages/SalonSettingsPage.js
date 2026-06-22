import React from 'react';
import DashboardLayout from '../widgets/DashboardLayout';
import { useSalonSettings } from '../features/settings/hooks/useSalonSettings';
import InfoSection from '../features/settings/components/InfoSection';
import WorkHoursSection from '../features/settings/components/WorkHoursSection';
import RegularDaysOffSection from '../features/settings/components/RegularDaysOffSection';
import SpecialDaysOffSection from '../features/settings/components/SpecialDaysOffSection';
import BreaksSection from '../features/settings/components/BreaksSection';

function Spinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        color: '#94a3b8',
        fontSize: 14,
      }}
    >
      Завантаження…
    </div>
  );
}

export default function SalonSettingsPage() {
  const {
    salonQuery,
    settingsQuery,
    updateSalonMutation,
    updateSettingsMutation,
    addRegularDayOffMutation,
    removeRegularDayOffMutation,
    addSpecialDayOffMutation,
    removeSpecialDayOffMutation,
    addBreakMutation,
  } = useSalonSettings();

  const isLoading = salonQuery.isLoading || settingsQuery.isLoading;

  return (
    <DashboardLayout title="Налаштування салону">
      {isLoading ? (
        <Spinner />
      ) : (
        <div
          style={{
            padding: '24px',
            maxWidth: 680,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <InfoSection salon={salonQuery.data} mutation={updateSalonMutation} />
          <WorkHoursSection settings={settingsQuery.data} mutation={updateSettingsMutation} />
          <RegularDaysOffSection
            settings={settingsQuery.data}
            addMutation={addRegularDayOffMutation}
            removeMutation={removeRegularDayOffMutation}
          />
          <SpecialDaysOffSection
            settings={settingsQuery.data}
            addMutation={addSpecialDayOffMutation}
            removeMutation={removeSpecialDayOffMutation}
          />
          <BreaksSection settings={settingsQuery.data} addMutation={addBreakMutation} />
        </div>
      )}
    </DashboardLayout>
  );
}
