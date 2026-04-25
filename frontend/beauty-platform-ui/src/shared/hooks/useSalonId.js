import { useAuthStore } from '../../features/auth/store/authStore';

export function useSalonId() {
  return useAuthStore((s) => s.salonId);
}
