import api from './api';

export async function register(email, password) {
  const { data } = await api.post('/auth/register', { email, password });
  return data;
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { access_token, refresh_token, token_type }
}

export async function logout(refreshToken) {
  await api.post('/auth/logout', { refresh_token: refreshToken });
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data; // { id, email, role, is_active }
}

export default { register, login, logout, fetchMe };
