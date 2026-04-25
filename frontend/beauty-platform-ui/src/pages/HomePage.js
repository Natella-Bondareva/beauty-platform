import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../widgets/DashboardLayout';
import ScheduleGrid from '../features/schedule/components/ScheduleGrid';
import { useEmployees } from '../features/employees/hooks/useEmployees';
import { useSalonId } from '../shared/hooks/useSalonId';

export default function HomePage() {
  const navigate = useNavigate();
  const salonId = useSalonId();

  const [viewMode, setViewMode] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMasterId, setSelectedMasterId] = useState(null);

  const { data: employees = [], isLoading } = useEmployees();

  // Redirect if not authenticated
  if (!salonId) {
    navigate('/login');
    return null;
  }

  // Auto-select first master when data loads
  if (!isLoading && employees.length > 0 && selectedMasterId === null) {
    setSelectedMasterId(employees[0].id);
  }

  return (
    <DashboardLayout
      title="Розклад"
      contentStyle={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <ScheduleGrid
        employees={employees}
        appointments={[]}
        loading={isLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedMasterId={selectedMasterId}
        setSelectedMasterId={setSelectedMasterId}
        onNewBooking={() => {}}
      />
    </DashboardLayout>
  );
}
