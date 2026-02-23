import { api } from './client';

export const analyticsApi = {
  overview: (days = 30) =>
    api.get('/analytics/overview', { params: { days } }).then((r) => r.data),

  conversionTrend: (days = 30) =>
    api.get('/analytics/conversion-trend', { params: { days } }).then((r) => r.data),

  peakHours: (days = 30) =>
    api.get('/analytics/peak-hours', { params: { days } }).then((r) => r.data),

  topServices: (days = 30) =>
    api.get('/analytics/top-services', { params: { days } }).then((r) => r.data),

  channelBreakdown: (days = 30) =>
    api.get('/analytics/channel-breakdown', { params: { days } }).then((r) => r.data),
};
