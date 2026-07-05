// services/analytics.js
// Talks to the /analytics/mock/* endpoints that power the Business Analytics Dashboard.
// Kept intentionally simple: one function per endpoint, all returning the raw JSON
// the backend already shapes for charts ({ labels, series } / { kpis } / etc).

import api from './api';

// days: 7 | 30 | 90
export async function getMockKpis() {
  const res = await api.get('/analytics/mock/kpis');
  return res.data; // { kpis: [{ label, value, change, trend }] }
}

export async function getMockRevenue(days = 30) {
  const res = await api.get(`/analytics/mock/revenue?days=${days}`);
  return res.data; // { labels, series: [{ name, data }] }
}

export async function getMockUsers(days = 30) {
  const res = await api.get(`/analytics/mock/users?days=${days}`);
  return res.data; // { labels, series: [{ name, data }] }
}

export async function getMockRegions() {
  const res = await api.get('/analytics/mock/regions');
  return res.data; // { labels, series: [{ name, data }, { name, data }] }
}

export async function getMockTools() {
  const res = await api.get('/analytics/mock/tools');
  return res.data; // { labels, data }
}
