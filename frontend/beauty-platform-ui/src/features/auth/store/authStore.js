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
    token:  localStorage.getItem('token')  ?? null,
    salonId: localStorage.getItem('salonId') ?? null,
    userId:  localStorage.getItem('userId')  ?? null,
    role:    localStorage.getItem('role')    ?? null,
  };
}

export const useAuthStore = create((set) => {
  const { token, salonId, userId, role } = readLocalStorage();

  return {
    token,
    salonId,
    userId,
    role,
    userName: token ? parseUserName(token) : '',

    setAuth: ({ token: t, salonId: s, userId: u, role: r }) => {
      localStorage.setItem('token', t);
      if (s) localStorage.setItem('salonId', s);
      if (u) localStorage.setItem('userId', u);
      if (r) localStorage.setItem('role', r);
      set({
        token: t,
        salonId: s ?? null,
        userId: u ?? null,
        role: r ?? null,
        userName: parseUserName(t),
      });
    },

    clearAuth: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('salonId');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      set({ token: null, salonId: null, userId: null, role: null, userName: '' });
    },
  };
});
