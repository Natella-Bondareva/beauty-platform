import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import { useSalonId } from '../../../shared/hooks/useSalonId';
import { employeeKey } from './useEmployees';

export function useEmployeeServices(employeeId) {
  const salonId = useSalonId();
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: employeeKey(salonId, employeeId) });

  const assignMutation = useMutation({
    mutationFn: ({ serviceId, overrides = {} }) =>
      employeeApi.assignService(salonId, employeeId, serviceId, {
        priceOverride: null,
        systemDurationOverride: null,
        clientDurationOverride: null,
        ...overrides,
      }),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (serviceId) => employeeApi.removeService(salonId, employeeId, serviceId),
    onSuccess: invalidate,
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ serviceId, priceOverride }) =>
      employeeApi.updateServicePrice(salonId, employeeId, serviceId, priceOverride),
    onSuccess: invalidate,
  });

  return { assignMutation, removeMutation, updatePriceMutation };
}
