import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Mail,
  Globe,
  CreditCard,
  Calendar,
  Radio,
  MessageSquare,
  CalendarCheck,
  Zap,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../../api/admin.api';
import Spinner from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const PLANS = ['FREE', 'STARTER', 'BUSINESS', 'PRO'];

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [convoPage, setConvoPage] = useState(1);
  const [planModal, setPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('BUSINESS');
  const [deleteModal, setDeleteModal] = useState(false);

  // --- Queries ---

  const {
    data: tenant,
    isLoading: tenantLoading,
  } = useQuery({
    queryKey: ['admin-tenant', id],
    queryFn: () => adminApi.getTenant(id!),
    enabled: !!id,
  });

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['admin-tenant-channels', id],
    queryFn: () => adminApi.getTenantChannels(id!),
    enabled: !!id,
  });

  const { data: convosData, isLoading: convosLoading } = useQuery({
    queryKey: ['admin-tenant-conversations', id, convoPage],
    queryFn: () => adminApi.getTenantConversations(id!, convoPage),
    enabled: !!id,
  });

  // --- Mutations ---

  const activateMut = useMutation({
    mutationFn: () => adminApi.activateTenant(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenant', id] });
      qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      toast.success('Tenant activated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to activate'),
  });

  const deactivateMut = useMutation({
    mutationFn: () => adminApi.deactivateTenant(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenant', id] });
      qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      toast.success('Tenant deactivated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to deactivate'),
  });

  const planMut = useMutation({
    mutationFn: (plan: string) => adminApi.assignPlan(id!, plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenant', id] });
      qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      setPlanModal(false);
      toast.success('Plan updated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to change plan'),
  });

  const deleteMut = useMutation({
    mutationFn: () => adminApi.deleteTenant(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      toast.success('Tenant deleted');
      navigate('/admin/tenants');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to delete tenant'),
  });

  // --- Helpers ---

  const plan = tenant?.subscriptions?.[0]?.plan;
  const owner = tenant?.users?.[0];
  const isActive = tenant?.isActive;

  const usage = tenant?.usage ?? {};
  const limits = plan ?? {};

  function usagePercent(used: number | undefined, max: number | undefined): number {
    if (!used || !max || max === -1) return 0;
    return Math.min(100, Math.round((used / max) * 100));
  }

  const convoTotalPages = convosData ? Math.ceil((convosData.total ?? 0) / 20) : 1;

  if (tenantLoading) return <Spinner />;
  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <p className="text-sm">Tenant not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/admin/tenants')}>
          Back to Tenants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/tenants')}
            className="p-2 text-dim hover:text-foreground hover:bg-surface rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tenant.name}</h1>
            <p className="text-muted text-sm mt-0.5">/{tenant.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? (
            <Button
              variant="secondary"
              size="sm"
              icon={<ToggleLeft className="w-4 h-4" />}
              loading={deactivateMut.isPending}
              onClick={() => deactivateMut.mutate()}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              icon={<ToggleRight className="w-4 h-4" />}
              loading={activateMut.isPending}
              onClick={() => activateMut.mutate()}
            >
              Activate
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<CreditCard className="w-4 h-4" />}
            onClick={() => {
              setSelectedPlan(plan?.type ?? 'BUSINESS');
              setPlanModal(true);
            }}
          >
            Change Plan
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            icon: <Building2 className="w-4 h-4" />,
            label: 'Business Name',
            value: tenant.name,
          },
          {
            icon: <Globe className="w-4 h-4" />,
            label: 'Slug',
            value: `/${tenant.slug}`,
          },
          {
            icon: <Mail className="w-4 h-4" />,
            label: 'Owner Email',
            value: owner?.email ?? '--',
          },
          {
            icon: <CreditCard className="w-4 h-4" />,
            label: 'Plan',
            value: plan?.type ?? 'No Plan',
          },
          {
            icon: <ToggleRight className="w-4 h-4" />,
            label: 'Status',
            value: isActive ? 'Active' : 'Inactive',
            badge: true,
          },
          {
            icon: <Calendar className="w-4 h-4" />,
            label: 'Created',
            value: new Date(tenant.createdAt).toLocaleDateString(),
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4 border border-b-border"
          >
            <div className="flex items-center gap-2 text-muted mb-1">
              {card.icon}
              <span className="text-xs font-medium uppercase tracking-wider">{card.label}</span>
            </div>
            {card.badge ? (
              <div className="mt-1">
                <Badge
                  label={card.value}
                  variant={isActive ? 'green' : 'red'}
                />
              </div>
            ) : (
              <p className="text-sm font-medium text-foreground truncate">{card.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Usage Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 border border-b-border"
      >
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-5">
          Monthly Usage
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              label: 'Messages',
              icon: <MessageSquare className="w-4 h-4" />,
              used: usage.messagesUsed ?? 0,
              max: limits.maxMessagesPerMonth,
              color: 'blue',
            },
            {
              label: 'Bookings',
              icon: <CalendarCheck className="w-4 h-4" />,
              used: usage.bookingsUsed ?? 0,
              max: limits.maxBookingsPerMonth,
              color: 'violet',
            },
            {
              label: 'AI Calls',
              icon: <Zap className="w-4 h-4" />,
              used: usage.aiCallsUsed ?? 0,
              max: limits.maxAiCallsPerMonth,
              color: 'emerald',
            },
          ].map((item) => {
            const pct = usagePercent(item.used, item.max);
            const maxLabel = item.max === -1 ? 'Unlimited' : (item.max ?? 0).toLocaleString();
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted">
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-xs text-dim">
                    {item.used.toLocaleString()} / {maxLabel}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      item.color === 'blue'
                        ? 'bg-blue-500'
                        : item.color === 'violet'
                          ? 'bg-violet-500'
                          : 'bg-emerald-500'
                    }`}
                  />
                </div>
                {item.max !== -1 && (
                  <p className="text-xs text-dim text-right">{pct}% used</p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl border border-b-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-b-border">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Channels
          </h2>
        </div>
        {channelsLoading ? (
          <Spinner size="sm" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-b-border">
                  {['Channel', 'Type', 'Status', 'Created'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-b-border">
                {(!channels || channels.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted text-sm">
                      No channels connected.
                    </td>
                  </tr>
                )}
                {channels?.map((ch: any) => (
                  <tr key={ch.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-muted">
                          <Radio className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {ch.name ?? ch.phoneNumber ?? ch.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted uppercase">{ch.type}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        label={ch.status ?? 'Unknown'}
                        variant={
                          ch.status === 'CONNECTED'
                            ? 'green'
                            : ch.status === 'ERROR'
                              ? 'red'
                              : 'gray'
                        }
                      />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-dim">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl border border-b-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-b-border">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Conversations
          </h2>
          <p className="text-xs text-dim mt-0.5">
            {convosData?.total ?? 0} total conversations
          </p>
        </div>
        {convosLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-b-border">
                    {['Contact', 'Channel', 'Messages', 'Last Activity'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-b-border">
                  {(!convosData?.conversations || convosData.conversations.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted text-sm">
                        No conversations yet.
                      </td>
                    </tr>
                  )}
                  {convosData?.conversations?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-muted">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {c.contact?.name ?? c.contact?.phone ?? 'Unknown'}
                            </div>
                            {c.contact?.phone && c.contact?.name && (
                              <div className="text-xs text-dim">{c.contact.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted uppercase">
                        {c.channel?.type ?? '--'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted">
                        {c._count?.messages ?? c.messageCount ?? '--'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-dim">
                        {c.lastMessageAt
                          ? new Date(c.lastMessageAt).toLocaleString()
                          : new Date(c.updatedAt ?? c.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {convoTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-b-border">
                <span className="text-xs text-dim">
                  Page {convoPage} / {convoTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConvoPage((p) => Math.max(1, p - 1))}
                    disabled={convoPage === 1}
                    className="p-1.5 text-dim hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConvoPage((p) => Math.min(convoTotalPages, p + 1))}
                    disabled={convoPage === convoTotalPages}
                    className="p-1.5 text-dim hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Change Plan Modal */}
      <Modal
        open={planModal}
        onClose={() => setPlanModal(false)}
        title="Change Plan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Select a new plan for <span className="font-medium text-foreground">{tenant.name}</span>.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlan(p)}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedPlan === p
                    ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                    : 'bg-surface text-muted border border-b-border hover:border-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setPlanModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={planMut.isPending}
              onClick={() => planMut.mutate(selectedPlan)}
            >
              Assign Plan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Tenant"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to permanently delete{' '}
            <span className="font-medium text-foreground">{tenant.name}</span>?
            This will remove all associated data including channels, conversations, and bookings.
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleteMut.isPending}
              onClick={() => deleteMut.mutate()}
            >
              Delete Tenant
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
