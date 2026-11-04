import api from './api';

export const authService = {
  login: async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    if (res.data?.token) {
      localStorage.setItem('ctf_token', res.data.token);
      localStorage.setItem('ctf_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  register: async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    if (res.data?.token) {
      localStorage.setItem('ctf_token', res.data.token);
      localStorage.setItem('ctf_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('ctf_token');
    localStorage.removeItem('ctf_user');
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem('ctf_user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
};
