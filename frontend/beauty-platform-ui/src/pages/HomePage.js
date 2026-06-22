import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../widgets/DashboardLayout';
import ScheduleGrid from '../features/schedule/components/ScheduleGrid';
import AdminBookingModal from '../features/schedule/components/AdminBookingModal';
import BookingDetailModal from '../features/schedule/components/BookingDetailModal';
import { useEmployees } from '../features/employees/hooks/useEmployees';
import { useScheduleData } from '../features/schedule/hooks/useScheduleData';
import { useSalonId } from '../shared/hooks/useSalonId';

export default function HomePage() {
  const navigate = useNavigate();
  const salonId = useSalonId();

  const [viewMode, setViewMode]           = useState('week');
  const [selectedDate, setSelectedDate]   = useState(new Date());
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [bookingSlot, setBookingSlot]         = useState(null); // { employeeId, date, time }
  const [detailBookingId, setDetailBookingId] = useState(null);

  const { data: employees = [], isLoading: empLoading } = useEmployees();

  const { bookings, schedules, breaks, isLoading: scheduleLoading } =
    useScheduleData(selectedDate);

  // Redirect if not authenticated
  if (!salonId) {
    navigate('/login');
    return null;
  }

  // Auto-select first master when data loads
  if (!empLoading && employees.length > 0 && selectedMasterId === null) {
    setSelectedMasterId(employees[0].id);
  }

  return (
    <DashboardLayout title="Розклад">
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ScheduleGrid
          employees={employees}
          bookings={bookings}
          schedules={schedules}
          breaks={breaks}
          loading={empLoading || scheduleLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMasterId={selectedMasterId}
          setSelectedMasterId={setSelectedMasterId}
          onNewBooking={setBookingSlot}
          onBookingClick={setDetailBookingId}
        />

        {bookingSlot && (
          <AdminBookingModal
            slot={bookingSlot}
            bookings={bookings}
            employees={employees}
            onClose={() => setBookingSlot(null)}
            onSuccess={() => setBookingSlot(null)}
          />
        )}

        {detailBookingId && (
          <BookingDetailModal
            bookingId={detailBookingId}
            onClose={() => setDetailBookingId(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
