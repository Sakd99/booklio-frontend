import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Clock, Star, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { remindersApi } from '../../api/reminders.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const PLACEHOLDERS = {
  msg24h: 'Hi {name}! 👋 Reminder: you have an appointment for "{service}" tomorrow at {time}. See you then!',
  msg1h: 'Hi {name}! ⏰ Your appointment for "{service}" is in 1 hour at {time}. See you soon!',
  review: 'Hi {name}! 🌟 Thank you for visiting us! How was your experience with "{service}"? Please reply with a rating from 1-5.',
};

export default function Reminders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['reminder-settings'], queryFn: remindersApi.getSettings });

  const [form, setForm] = useState({
    enabled: true,
    remind24h: true,
    remind1h: true,
    customMessage24h: '',
    customMessage1h: '',
    reviewEnabled: false,
    reviewMessage: '',
    reviewDelayMinutes: 30,
  });

  const [initialized, setInitialized] = useState(false);
  if (data && !initialized) {
    setForm({
      enabled: data.enabled,
      remind24h: data.remind24h,
      remind1h: data.remind1h,
      customMessage24h: data.customMessage24h ?? '',
      customMessage1h: data.customMessage1h ?? '',
      reviewEnabled: data.reviewEnabled,
      reviewMessage: data.reviewMessage ?? '',
      reviewDelayMinutes: data.reviewDelayMinutes,
    });
    setInitialized(true);
  }

  const saveMut = useMutation({
    mutationFn: () => remindersApi.updateSettings({
      ...form,
      customMessage24h: form.customMessage24h || null,
      customMessage1h: form.customMessage1h || null,
      reviewMessage: form.reviewMessage || null,
    } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminder-settings'] });
      toast.success('Reminder settings saved!');
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Appointment Reminders</h1>
        <p className="text-sm text-muted mt-1">Automatically send reminders to customers before their appointments to reduce no-shows.</p>
      </div>

      {/* Master Toggle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Enable Reminders</h2>
              <p className="text-xs text-muted">Send automatic reminders via the same channel the customer used</p>
            </div>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.enabled ? 'bg-blue-500' : 'bg-surface'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.enabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </motion.div>

      {form.enabled && (
        <div className="space-y-4">
          {/* 24h Reminder */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">24-Hour Reminder</h3>
                  <p className="text-xs text-muted">Sent ~24 hours before the appointment</p>
                </div>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, remind24h: !f.remind24h }))}
                className={`relative w-11 h-5 rounded-full transition-colors ${form.remind24h ? 'bg-violet-500' : 'bg-surface'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.remind24h ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            {form.remind24h && (
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">
                  Custom Message <span className="text-dim">(leave empty for default)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.customMessage24h}
                  onChange={(e) => setForm((f) => ({ ...f, customMessage24h: e.target.value }))}
                  placeholder={PLACEHOLDERS.msg24h}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
                />
                <p className="text-[11px] text-dim mt-1.5">
                  Variables: <code className="bg-surface px-1 rounded">{'{name}'}</code>{' '}
                  <code className="bg-surface px-1 rounded">{'{service}'}</code>{' '}
                  <code className="bg-surface px-1 rounded">{'{date}'}</code>{' '}
                  <code className="bg-surface px-1 rounded">{'{time}'}</code>
                </p>
              </div>
            )}
          </motion.div>

          {/* 1h Reminder */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">1-Hour Reminder</h3>
                  <p className="text-xs text-muted">Sent ~1 hour before the appointment</p>
                </div>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, remind1h: !f.remind1h }))}
                className={`relative w-11 h-5 rounded-full transition-colors ${form.remind1h ? 'bg-orange-500' : 'bg-surface'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.remind1h ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            {form.remind1h && (
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Custom Message</label>
                <textarea
                  rows={3}
                  value={form.customMessage1h}
                  onChange={(e) => setForm((f) => ({ ...f, customMessage1h: e.target.value }))}
                  placeholder={PLACEHOLDERS.msg1h}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
                />
              </div>
            )}
          </motion.div>

          {/* Review Requests */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Review Requests</h3>
                  <p className="text-xs text-muted">Ask for a review after the appointment is completed</p>
                </div>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, reviewEnabled: !f.reviewEnabled }))}
                className={`relative w-11 h-5 rounded-full transition-colors ${form.reviewEnabled ? 'bg-amber-500' : 'bg-surface'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.reviewEnabled ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            {form.reviewEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Delay after appointment ends</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={1440}
                      value={form.reviewDelayMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, reviewDelayMinutes: +e.target.value }))}
                      className="w-24 px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    <span className="text-sm text-muted">minutes</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Custom Review Message</label>
                  <textarea
                    rows={3}
                    value={form.reviewMessage}
                    onChange={(e) => setForm((f) => ({ ...f, reviewMessage: e.target.value }))}
                    placeholder={PLACEHOLDERS.review}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted">
          Reminders are sent via the same channel the customer used (Instagram, WhatsApp, Telegram, etc.).
          Only appointments with an active conversation will receive reminders.
          The reminder system checks every 5 minutes.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => saveMut.mutate()} loading={saveMut.isPending}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
