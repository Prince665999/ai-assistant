// All calls to the /auth/* endpoints live here. Screens and contexts
// should call these functions rather than hitting `api` directly, so the
// endpoint shapes only need to be known in one place.

import api from './api';

export async function registerRequest(email, password) {
  const { data } = await api.post('/auth/register', { email, password });
  return data; // { id, email, role, is_active }
}

export async function loginRequest(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { access_token, refresh_token, token_type }
}

export async function logoutRequest(refreshToken) {
  await api.post('/auth/logout', { refresh_token: refreshToken });
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data; // { id, email, role, is_active }
}

export default { registerRequest, loginRequest, logoutRequest, getMe };
