import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../../api/admin.api';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Spinner from '../../../components/ui/Spinner';
import { useI18n } from '../../../store/i18n.store';

const PLAN_COLORS: Record<string, string> = {
  FREE: 'border-b-border',
  STARTER: 'border-blue-500/30 bg-blue-500/5',
  BUSINESS: 'border-violet-500/30 bg-violet-500/5',
  PRO: 'border-emerald-500/30 bg-emerald-500/5',
  AGENCY: 'border-orange-500/30 bg-orange-500/5',
};
const PLAN_LABEL_COLORS: Record<string, string> = {
  FREE: 'text-muted',
  STARTER: 'text-blue-500',
  BUSINESS: 'text-violet-500',
  PRO: 'text-emerald-500',
  AGENCY: 'text-orange-500',
};

const PLAN_TYPES = ['FREE', 'STARTER', 'BUSINESS', 'PRO', 'AGENCY'] as const;
type PlanType = (typeof PLAN_TYPES)[number];

interface PlanFeatures {
  bookings: boolean;
  analytics: boolean;
  customWorkflows: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  dedicatedSupport: boolean;
}

interface PlanForm {
  name: string;
  type: PlanType;
  description: string;
  priceUsd: number;
  maxMessagesPerMonth: number;
  maxAiCallsPerMonth: number;
  maxBookingsPerMonth: number;
  maxChannels: number;
  maxTeamMembers: number;
  features: PlanFeatures;
}

const emptyForm = (): PlanForm => ({
  name: '',
  type: 'FREE',
  description: '',
  priceUsd: 0,
  maxMessagesPerMonth: 0,
  maxAiCallsPerMonth: 0,
  maxBookingsPerMonth: 0,
  maxChannels: 1,
  maxTeamMembers: 1,
  features: {
    bookings: false,
    analytics: false,
    customWorkflows: false,
    prioritySupport: false,
    whiteLabel: false,
    dedicatedSupport: false,
  },
});

const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  bookings: 'Bookings',
  analytics: 'Analytics',
  customWorkflows: 'Custom Workflows',
  prioritySupport: 'Priority Support',
  whiteLabel: 'White Label',
  dedicatedSupport: 'Dedicated Support',
};

function fmt(n: number) {
  if (n === -1) return '\u221e';
  return n.toLocaleString();
}

export default function Plans() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: adminApi.listPlans,
  });

  const createMut = useMutation({
    mutationFn: adminApi.createPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
      setModal(null);
      toast.success('Plan created!');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to create plan'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updatePlan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
      setModal(null);
      toast.success('Plan updated!');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to update plan'),
  });

  const deleteMut = useMutation({
    mutationFn: adminApi.deletePlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
      setDeleteTarget(null);
      toast.success('Plan deleted!');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to delete plan'),
  });

  const openCreate = () => {
    setForm(emptyForm());
    setEditing(null);
    setModal('create');
  };

  const openEdit = (plan: any) => {
    setForm({
      name: plan.name ?? '',
      type: plan.type ?? 'FREE',
      description: plan.description ?? '',
      priceUsd: plan.priceUsd ?? 0,
      maxMessagesPerMonth: plan.maxMessagesPerMonth ?? 0,
      maxAiCallsPerMonth: plan.maxAiCallsPerMonth ?? 0,
      maxBookingsPerMonth: plan.maxBookingsPerMonth ?? 0,
      maxChannels: plan.maxChannels ?? 1,
      maxTeamMembers: plan.maxTeamMembers ?? 1,
      features: {
        bookings: plan.features?.bookings ?? false,
        analytics: plan.features?.analytics ?? false,
        customWorkflows: plan.features?.customWorkflows ?? false,
        prioritySupport: plan.features?.prioritySupport ?? false,
        whiteLabel: plan.features?.whiteLabel ?? false,
        dedicatedSupport: plan.features?.dedicatedSupport ?? false,
      },
    });
    setEditing(plan);
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'create') createMut.mutate(form);
    else if (editing) updateMut.mutate({ id: editing.id, data: form });
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMut.mutate(deleteTarget.id);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plans</h1>
          <p className="text-muted text-sm mt-1">{plans?.length ?? 0} active plans</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
          {t('create')} Plan
        </Button>
      </div>

      {/* Plan cards grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
        {plans?.map((plan: any, i: number) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card rounded-2xl p-5 border ${PLAN_COLORS[plan.type] ?? 'border-b-border'}`}
          >
            <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${PLAN_LABEL_COLORS[plan.type]}`}>
              {plan.type}
            </div>
            <div className="flex items-baseline gap-1 mb-0.5">
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              {plan.priceUsd > 0 && (
                <span className={`text-sm font-bold ${PLAN_LABEL_COLORS[plan.type]}`}>${plan.priceUsd}/mo</span>
              )}
              {plan.priceUsd === 0 && (
                <span className="text-sm font-bold text-dim">Free</span>
              )}
            </div>
            <p className="text-xs text-muted mb-4">{plan.description}</p>

            <div className="space-y-2.5">
              {[
                { label: 'Messages/mo', value: fmt(plan.maxMessagesPerMonth) },
                { label: 'AI calls/mo', value: fmt(plan.maxAiCallsPerMonth) },
                { label: 'Bookings/mo', value: fmt(plan.maxBookingsPerMonth) },
                { label: 'Channels', value: fmt(plan.maxChannels) },
                { label: 'Team members', value: fmt(plan.maxTeamMembers) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{item.label}</span>
                  <span className={`font-medium ${item.value === '\u221e' ? PLAN_LABEL_COLORS[plan.type] : 'text-foreground'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-b-border">
              <div className="text-xs text-muted mb-2">Features</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(plan.features ?? {}).map(([key, val]) =>
                  val ? (
                    <span key={key} className="flex items-center gap-1 text-[10px] text-muted bg-surface px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ) : null
                )}
              </div>
            </div>

            {/* Edit / Delete buttons */}
            <div className="mt-4 pt-4 border-t border-b-border flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil className="w-3.5 h-3.5" />}
                onClick={() => openEdit(plan)}
              >
                {t('edit')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => setDeleteTarget(plan)}
              >
                {t('delete')}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'create' ? `${t('create')} Plan` : `${t('edit')} Plan`}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Name */}
          <div>
            <label className="block text-sm text-muted mb-1.5">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Plan name"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-muted mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PlanType }))}
              className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {PLAN_TYPES.map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('description')}</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Short description"
            />
          </div>

          {/* Price USD */}
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('price')} (USD)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.priceUsd}
              onChange={(e) => setForm((f) => ({ ...f, priceUsd: parseFloat(e.target.value) || 0 }))}
              className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Numeric limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1.5">Max Messages/Mo</label>
              <input
                type="number"
                min={-1}
                value={form.maxMessagesPerMonth}
                onChange={(e) => setForm((f) => ({ ...f, maxMessagesPerMonth: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <p className="text-[10px] text-muted mt-0.5">-1 = unlimited</p>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Max AI Calls/Mo</label>
              <input
                type="number"
                min={-1}
                value={form.maxAiCallsPerMonth}
                onChange={(e) => setForm((f) => ({ ...f, maxAiCallsPerMonth: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <p className="text-[10px] text-muted mt-0.5">-1 = unlimited</p>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Max Bookings/Mo</label>
              <input
                type="number"
                min={-1}
                value={form.maxBookingsPerMonth}
                onChange={(e) => setForm((f) => ({ ...f, maxBookingsPerMonth: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <p className="text-[10px] text-muted mt-0.5">-1 = unlimited</p>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Max Channels</label>
              <input
                type="number"
                min={1}
                value={form.maxChannels}
                onChange={(e) => setForm((f) => ({ ...f, maxChannels: parseInt(e.target.value) || 1 }))}
                className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Max Team Members</label>
              <input
                type="number"
                min={1}
                value={form.maxTeamMembers}
                onChange={(e) => setForm((f) => ({ ...f, maxTeamMembers: parseInt(e.target.value) || 1 }))}
                className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Features checkboxes */}
          <div>
            <label className="block text-sm text-muted mb-2">Features</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FEATURE_LABELS) as (keyof PlanFeatures)[]).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none rounded-lg px-3 py-2 hover:bg-surface transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.features[key]}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        features: { ...f.features, [key]: e.target.checked },
                      }))
                    }
                    className="rounded border-b-border accent-blue-500"
                  />
                  {FEATURE_LABELS[key]}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setModal(null)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={createMut.isPending || updateMut.isPending}
            >
              {modal === 'create' ? t('create') : t('save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={`${t('delete')} Plan`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleteMut.isPending}
              onClick={confirmDelete}
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
