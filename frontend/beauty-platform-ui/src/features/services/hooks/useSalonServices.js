import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salonApi } from '../api/salon.api';
import { useSalonId } from '../../../shared/hooks/useSalonId';

const categoriesKey = (salonId) => ['categories', salonId];
const allCategoriesKey = (salonId) => ['all-categories', salonId];
const servicesKey = (salonId) => ['services', salonId];

export function useSalonCategories() {
  const salonId = useSalonId();
  const qc = useQueryClient();

  const activeQuery = useQuery({
    queryKey: categoriesKey(salonId),
    queryFn: () => salonApi.getActiveCategories(salonId).then((r) => r.data ?? []),
    enabled: !!salonId,
  });

  const templatesQuery = useQuery({
    queryKey: allCategoriesKey(salonId),
    queryFn: () => salonApi.getCategories(salonId).then((r) => r.data ?? []),
    enabled: !!salonId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => salonApi.createCategory(salonId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKey(salonId) }),
  });

  return { activeQuery, templatesQuery, createMutation };
}

export function useSalonServices() {
  const salonId = useSalonId();
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: servicesKey(salonId) });

  const query = useQuery({
    queryKey: servicesKey(salonId),
    queryFn: () => salonApi.getServices(salonId).then((r) => r.data ?? []),
    enabled: !!salonId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => salonApi.createService(salonId, data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => salonApi.updateService(salonId, id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => salonApi.deleteService(salonId, id),
    onSuccess: invalidate,
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
