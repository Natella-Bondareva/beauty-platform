import { useQuery, useMutation } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import { useSalonId } from '../../../shared/hooks/useSalonId';

export function useEmployeeSchedule(employeeId, { enabled = true } = {}) {
  const salonId = useSalonId();

  const constraintsQuery = useQuery({
    queryKey: ['schedule-constraints', salonId, employeeId],
    queryFn: () =>
      employeeApi.getScheduleConstraints(salonId, employeeId).then((r) => r.data),
    enabled: !!salonId && !!employeeId && enabled,
  });

  const saveMutation = useMutation({
    mutationFn: (schedule) => employeeApi.updateSchedule(salonId, employeeId, schedule),
  });

  return { constraintsQuery, saveMutation };
}
