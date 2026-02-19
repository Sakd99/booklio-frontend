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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      setPlanModal(null);
      toast.success('Plan updated!');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tenants</h1>
        <p className="text-white/40 text-sm mt-1">{data?.total ?? 0} registered businesses</p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/5 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Business', 'Owner', 'Plan', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.tenants?.map((t: any) => {
                  const plan = t.subscriptions?.[0]?.plan;
                  const active = t.isActive;
                  return (
                    <tr key={t.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-white/50">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{t.name}</div>
                            <div className="text-xs text-white/30">/{t.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-white/50">{t.users?.[0]?.email ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        {plan ? statusBadge(plan.type) : <span className="text-xs text-white/20">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-1 rounded-full ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white/30">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setPlanModal({ id: t.id, name: t.name }); setSelectedPlan(plan?.type ?? 'BUSINESS'); }}
                            className="p-1.5 text-white/30 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Change plan"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          {active ? (
                            <button
                              onClick={() => deactivateMut.mutate(t.id)}
                              className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Deactivate"
                            >
                              <ToggleLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => activateMut.mutate(t.id)}
                              className="p-1.5 text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <span className="text-xs text-white/30">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 text-white/30 hover:text-white disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 text-white/30 hover:text-white disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
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
