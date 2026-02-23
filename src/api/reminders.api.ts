import { api } from './client';

export interface ReminderSettings {
  id: string;
  tenantId: string;
  enabled: boolean;
  remind24h: boolean;
  remind1h: boolean;
  customMessage24h: string | null;
  customMessage1h: string | null;
  reviewEnabled: boolean;
  reviewMessage: string | null;
  reviewDelayMinutes: number;
}

export const remindersApi = {
  getSettings: (): Promise<ReminderSettings> =>
    api.get('/reminders/settings').then((r) => r.data),

  updateSettings: (data: Partial<ReminderSettings>): Promise<ReminderSettings> =>
    api.put('/reminders/settings', data).then((r) => r.data),
};
