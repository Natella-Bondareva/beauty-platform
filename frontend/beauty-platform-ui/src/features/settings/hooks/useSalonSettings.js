import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';
import { useSalonId } from '../../../shared/hooks/useSalonId';

const salonKey = (salonId) => ['salon', salonId];
const settingsKey = (salonId) => ['salonSettings', salonId];

export function useSalonSettings() {
  const salonId = useSalonId();
  const qc = useQueryClient();

  const salonQuery = useQuery({
    queryKey: salonKey(salonId),
    queryFn: () => settingsApi.getSalon(salonId).then((r) => r.data),
    enabled: !!salonId,
  });

  const settingsQuery = useQuery({
    queryKey: settingsKey(salonId),
    queryFn: () => settingsApi.getSettings(salonId).then((r) => r.data),
    enabled: !!salonId,
  });

  const updateSalonMutation = useMutation({
    mutationFn: (data) => settingsApi.updateSalon(salonId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salonKey(salonId) }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => settingsApi.updateSettings(salonId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKey(salonId) }),
  });

  const addRegularDayOffMutation = useMutation({
    mutationFn: (dayOfWeek) => settingsApi.addRegularDayOff(salonId, dayOfWeek),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKey(salonId) }),
  });

  const removeRegularDayOffMutation = useMutation({
    mutationFn: (dayOfWeek) => settingsApi.removeRegularDayOff(salonId, dayOfWeek),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKey(salonId) }),
  });

  const addSpecialDayOffMutation = useMutation({
    mutationFn: (data) => settingsApi.addSpecialDayOff(salonId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKey(salonId) }),
  });

  const removeSpecialDayOffMutation = useMutation({
    mutationFn: (id) => settingsApi.removeSpecialDayOff(salonId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKey(salonId) }),
  });

  const addBreakMutation = useMutation({
    mutationFn: (data) => settingsApi.addBreak(salonId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKey(salonId) }),
  });

  return {
    salonQuery,
    settingsQuery,
    updateSalonMutation,
    updateSettingsMutation,
    addRegularDayOffMutation,
    removeRegularDayOffMutation,
    addSpecialDayOffMutation,
    removeSpecialDayOffMutation,
    addBreakMutation,
  };
}
