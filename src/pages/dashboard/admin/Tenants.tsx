import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Building2, ToggleLeft, ToggleRight, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../../api/admin.api';
import Spinner from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { statusBadge } from '../../../components/ui/Badge';

const PLANS = ['FREE', 'STARTER', 'BUSINESS', 'PRO'];

export default function Tenants() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [planModal, setPlanModal] = useState<{ id: string; name: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('BUSINESS');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants', page],
    queryFn: () => adminApi.listTenants(page, 20),
  });

  const activateMut = useMutation({
    mutationFn: adminApi.activateTenant,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); toast.success('Tenant activated'); },
  });

  const deactivateMut = useMutation({
    mutationFn: adminApi.deactivateTenant,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); toast.success('Tenant deactivated'); },
  });

  const planMut = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) => adminApi.assignPlan(id, plan),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); setPlanModal(null); toast.success('Plan updated!'); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
        <p className="text-muted text-sm mt-1">{data?.total ?? 0} registered businesses</p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-b-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-b-border">
                  {['Business', 'Owner', 'Plan', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-b-border">
                {data?.tenants?.map((t: any) => {
                  const plan = t.subscriptions?.[0]?.plan;
                  const active = t.isActive;
                  return (
                    <tr key={t.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-muted">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{t.name}</div>
                            <div className="text-xs text-dim">/{t.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted">{t.users?.[0]?.email ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        {plan ? statusBadge(plan.type) : <span className="text-xs text-dim">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-1 rounded-full ${active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-dim">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setPlanModal({ id: t.id, name: t.name }); setSelectedPlan(plan?.type ?? 'BUSINESS'); }}
                            className="p-1.5 text-dim hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Change plan"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          {active ? (
                            <button
                              onClick={() => deactivateMut.mutate(t.id)}
                              className="p-1.5 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Deactivate"
                            >
                              <ToggleLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => activateMut.mutate(t.id)}
                              className="p-1.5 text-dim hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Activate"
                            >
                              <ToggleRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-b-border">
              <span className="text-xs text-dim">Page {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 text-dim hover:text-foreground disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 text-dim hover:text-foreground disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Plan modal */}
      <Modal open={!!planModal} onClose={() => setPlanModal(null)} title={`Change plan for ${planModal?.name}`} size="sm">
        <div className="space-y-4">
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
            <Button variant="secondary" className="flex-1" onClick={() => setPlanModal(null)}>Cancel</Button>
            <Button
              className="flex-1"
              loading={planMut.isPending}
              onClick={() => planModal && planMut.mutate({ id: planModal.id, plan: selectedPlan })}
            >
              Assign plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
