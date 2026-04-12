import React from 'react';
import DaysOffSelector from './DaysOffSelector';

export default function DaysOffStep({
  regularDaysOff,
  specialDaysOff,
  newSpecialDate,
  newSpecialReason,
  setNewSpecialDate,
  setNewSpecialReason,
  handleRegularDayOffChange,
  addSpecialDayOff,
  removeSpecialDayOff
}) {
  return (
    <DaysOffSelector
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
}