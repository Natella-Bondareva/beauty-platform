import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: ({ data }) => {
      setAuth({
        token: data.token,
        salonId: data.salonId ?? null,
        userId: data.userId ?? null,
      });
      navigate('/dashboard');
    },
  });
}
