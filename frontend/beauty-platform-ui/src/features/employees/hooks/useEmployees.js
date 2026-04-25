import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import { useSalonId } from '../../../shared/hooks/useSalonId';

export const employeesKey = (salonId) => ['employees', salonId];
export const employeeKey = (salonId, id) => ['employee', salonId, id];

export function useEmployees() {
  const salonId = useSalonId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: employeesKey(salonId),
    queryFn: () => employeeApi.getAll(salonId).then((r) => r.data ?? []),
    enabled: !!salonId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => employeeApi.create(salonId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeesKey(salonId) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeeApi.update(salonId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeesKey(salonId) }),
  });

  return { ...query, createMutation, updateMutation };
}

export function useEmployeeDetail(employeeId) {
  const salonId = useSalonId();

  return useQuery({
    queryKey: employeeKey(salonId, employeeId),
    queryFn: () => employeeApi.getById(salonId, employeeId).then((r) => r.data),
    enabled: !!salonId && !!employeeId,
  });
}
