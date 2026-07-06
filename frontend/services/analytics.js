import api from './api';

// Real data (admin only)
export async function adminUsers() {
  const { data } = await api.get('/analytics/admin/users');
  return data;
}

export async function adminChat(days = 30) {
  const { data } = await api.get('/analytics/admin/chat', { params: { days } });
  return data;
}

export async function adminDocuments() {
  const { data } = await api.get('/analytics/admin/documents');
  return data;
}

export async function adminTools() {
  const { data } = await api.get('/analytics/admin/tools');
  return data;
}

// Mock data (practice dashboard, any authenticated user)
export async function mockRevenue(days = 30) {
  const { data } = await api.get('/analytics/mock/revenue', { params: { days } });
  return data;
}

export async function mockUsers(days = 30) {
  const { data } = await api.get('/analytics/mock/users', { params: { days } });
  return data;
}

export async function mockRegions() {
  const { data } = await api.get('/analytics/mock/regions');
  return data;
}

export async function mockTools() {
  const { data } = await api.get('/analytics/mock/tools');
  return data;
}

export async function mockKpis() {
  const { data } = await api.get('/analytics/mock/kpis');
  return data;
}

export default {
  adminUsers, adminChat, adminDocuments, adminTools,
  mockRevenue, mockUsers, mockRegions, mockTools, mockKpis,
};
