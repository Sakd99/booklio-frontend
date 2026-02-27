import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Workflow, Play, Pause, Trash2,
  MessageSquare, Calendar, Zap, Tag, ArrowRight, Hash, Radio, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { automationsApi } from '../../api/automations.api';
import { channelsApi } from '../../api/channels.api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';

const TRIGGERS = [
  { value: 'NEW_CONVERSATION', icon: <MessageSquare className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10', gradient: 'from-blue-500 to-blue-600' },
  { value: 'KEYWORD', icon: <Tag className="w-4 h-4" />, color: 'text-violet-500 bg-violet-500/10', gradient: 'from-violet-500 to-violet-600' },
  { value: 'BOOKING_CREATED', icon: <Calendar className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-500/10', gradient: 'from-emerald-500 to-emerald-600' },
  { value: 'BOOKING_STATUS_CHANGED', icon: <Zap className="w-4 h-4" />, color: 'text-orange-500 bg-orange-500/10', gradient: 'from-orange-500 to-orange-600' },
  { value: 'MANUAL', icon: <Play className="w-4 h-4" />, color: 'text-gray-500 bg-gray-500/10', gradient: 'from-gray-500 to-gray-600' },
] as const;

const triggerMeta = (trigger: string) => TRIGGERS.find((t) => t.value === trigger) ?? TRIGGERS[4];

export default function Automations() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', trigger: 'NEW_CONVERSATION' as string, channelId: '' });

  const { data: automations, isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: automationsApi.list,
  });

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.list,
  });

  const connectedChannels = (channels ?? []).filter((ch: any) => ch.status === 'CONNECTED');

  const createMut = useMutation({
    mutationFn: () => automationsApi.create(form),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['automations'] });
      setCreateModal(false);
      setForm({ name: '', description: '', trigger: 'NEW_CONVERSATION', channelId: '' });
      toast.success(t('automationCreated'));
      navigate(`/dashboard/automations/${data.id}`);
    },
    onError: () => toast.error('Failed'),
  });

  const toggleMut = useMutation({
    mutationFn: automationsApi.toggle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: automationsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] });
      setDeleteTarget(null);
      toast.success(t('automationDeleted'));
    },
  });

  if (isLoading) return <Spinner />;

  const autoList = Array.isArray(automations) ? automations : [];
  const activeCount = autoList.filter((a: any) => a.isActive).length;
  const totalRuns = autoList.reduce((sum: number, a: any) => sum + (a.runCount || 0), 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('automationsTitle')}</h1>
          <p className="text-muted text-sm mt-1">{t('automationsDesc')}</p>
        </div>
        <Button onClick={() => setCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
          {t('createAutomation')}
        </Button>
      </div>

      {/* Stats row */}
      {autoList.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4 border border-b-border text-center"
          >
            <div className="text-2xl font-bold text-foreground">{autoList.length}</div>
            <div className="text-xs text-muted mt-0.5">{t('total')}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 text-center"
          >
            <div className="text-2xl font-bold text-emerald-500">{activeCount}</div>
            <div className="text-xs text-muted mt-0.5">{t('active')}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 border border-b-border text-center"
          >
            <div className="text-2xl font-bold text-foreground">{totalRuns}</div>
            <div className="text-xs text-muted mt-0.5">{t('runs')}</div>
          </motion.div>
        </div>
      )}

      {/* Automations list */}
      {!autoList.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-12 border border-b-border text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Workflow className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('noAutomations')}</h3>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">{t('noAutomationsDesc')}</p>
          <Button onClick={() => setCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
            {t('createAutomation')}
          </Button>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {autoList.map((auto: any, i: number) => {
            const tm = triggerMeta(auto.trigger);
            return (
              <motion.div
                key={auto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`glass-card rounded-2xl border border-b-border hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all cursor-pointer group flex flex-col overflow-hidden ${!auto.isActive ? 'opacity-70' : ''}`}
                onClick={() => navigate(`/dashboard/automations/${auto.id}`)}
              >
                {/* Status strip */}
                <div className={`h-1.5 ${auto.isActive ? 'bg-emerald-500' : 'bg-surface'}`} />

                {/* Card Header */}
                <div className="p-5 pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tm.color}`}>
                      {tm.icon}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMut.mutate(auto.id); }}
                        className={`p-1.5 rounded-lg transition-colors ${auto.isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted hover:bg-surface'}`}
                        title={auto.isActive ? t('deactivate') : t('activate')}
                      >
                        {auto.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(auto); }}
                        className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-1 truncate">{auto.name}</h3>
                  {auto.description && (
                    <p className="text-xs text-muted mb-3 line-clamp-2">{auto.description}</p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-auto p-5 pt-3">
                  <div className="flex items-center justify-between pt-3 border-t border-b-border">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${auto.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface text-muted'}`}>
                        {auto.isActive ? t('active') : t('inactive')}
                      </span>
                      <span className="text-[11px] text-dim flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {auto.runCount} {t('runs')}
                      </span>
                      {auto.channel ? (
                        <span className="text-[11px] text-dim flex items-center gap-1">
                          <Radio className="w-3 h-3" />
                          {auto.channel.externalName ?? auto.channel.type}
                        </span>
                      ) : (
                        <span className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          {t('noChannel')}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title={t('createAutomation')}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('name')}</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder={t('automationNamePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('description')}</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder={t('automationDescPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('channels')}</label>
            <select
              required
              value={form.channelId}
              onChange={(e) => setForm((f) => ({ ...f, channelId: e.target.value }))}
              className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="" disabled>{t('selectChannel')}</option>
              {connectedChannels.map((ch: any) => (
                <option key={ch.id} value={ch.id}>
                  {ch.externalName ?? ch.externalId} ({ch.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('trigger')}</label>
            <div className="grid grid-cols-1 gap-2">
              {TRIGGERS.map((tr) => (
                <label
                  key={tr.value}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    form.trigger === tr.value
                      ? 'border-violet-500/40 bg-violet-500/5 shadow-sm'
                      : 'border-b-border hover:bg-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="trigger"
                    value={tr.value}
                    checked={form.trigger === tr.value}
                    onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))}
                    className="sr-only"
                  />
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tr.color}`}>
                    {tr.icon}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {t(`trigger_${tr.value}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setCreateModal(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" loading={createMut.isPending}>
              {t('create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title={t('deleteAutomation')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {t('deleteAutomationConfirm')} <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>
              {t('cancel')}
            </Button>
            <Button variant="danger" className="flex-1" loading={deleteMut.isPending} onClick={() => deleteMut.mutate(deleteTarget.id)}>
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
