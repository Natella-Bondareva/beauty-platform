import { create } from 'zustand';

function parseUserName(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.firstName
      ? `${payload.firstName} ${payload.lastName ?? ''}`.trim()
      : (payload.email ?? '');
  } catch {
    return '';
  }
}

function readLocalStorage() {
  return {
    token: localStorage.getItem('token') ?? null,
    salonId: localStorage.getItem('salonId') ?? null,
    userId: localStorage.getItem('userId') ?? null,
  };
}

export const useAuthStore = create((set) => {
  const { token, salonId, userId } = readLocalStorage();

  return {
    token,
    salonId,
    userId,
    userName: token ? parseUserName(token) : '',

    setAuth: ({ token: t, salonId: s, userId: u }) => {
      localStorage.setItem('token', t);
      if (s) localStorage.setItem('salonId', s);
      if (u) localStorage.setItem('userId', u);
      set({ token: t, salonId: s ?? null, userId: u ?? null, userName: parseUserName(t) });
    },

    clearAuth: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('salonId');
      localStorage.removeItem('userId');
      set({ token: null, salonId: null, userId: null, userName: '' });
    },
  };
});
