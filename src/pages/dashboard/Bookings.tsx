import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi, CreateBookingPayload } from '../../api/bookings.api';
import { servicesApi } from '../../api/services.api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import { useI18n } from '../../store/i18n.store';

const STATUSES = ['', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;
const STATUS_KEYS: Record<string, string> = {
  CONFIRMED: 'statusConfirmed', PENDING: 'statusPending', COMPLETED: 'statusCompleted',
  CANCELLED: 'statusCancelled', NO_SHOW: 'statusNoShow',
};

export default function Bookings() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateBookingPayload>({ serviceId: '', customerName: '', customerContact: '', startsAt: '', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', page, statusFilter],
    queryFn: () => bookingsApi.list({ page, limit: 15, status: statusFilter || undefined }),
  });
  const { data: services } = useQuery({ queryKey: ['services'], queryFn: servicesApi.list });

  const createMut = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); setCreateOpen(false); toast.success(t('bookingCreated')); setForm({ serviceId: '', customerName: '', customerContact: '', startsAt: '', notes: '' }); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? t('error')),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success(t('statusUpdated')); },
  });

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('bookingsTitle')}</h1>
          <p className="text-muted text-sm mt-1">{t('bookingsDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dim" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-base !w-auto !py-2">
              <option value="">{t('all')}</option>
              {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{t(STATUS_KEYS[s] as any)}</option>)}
            </select>
          </div>
          <Button onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>{t('create')}</Button>
        </div>
      </div>

      {isLoading ? <Spinner /> : !data?.items?.length ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-b-border">
          <Calendar className="w-12 h-12 text-dim mx-auto mb-4" />
          <p className="text-muted">{t('noBookingsFound')}</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-b-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-b-border">
                  {[t('customer'), t('service'), t('date'), t('contact'), t('status'), t('actions')].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider ltr:text-left rtl:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-b-border">
                {data?.items?.map((bk: any) => (
                  <motion.tr key={bk.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3.5 text-sm text-foreground font-medium">{bk.customerName}</td>
                    <td className="px-4 py-3.5 text-sm text-muted">{bk.service?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-muted">{new Date(bk.startsAt).toLocaleDateString()} {new Date(bk.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3.5 text-sm text-muted">{bk.customerContact}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={bk.status} /></td>
                    <td className="px-4 py-3.5">
                      <select value={bk.status} onChange={(e) => statusMut.mutate({ id: bk.id, status: e.target.value })} className="input-base !w-auto !py-1 !px-2 !text-xs">
                        {['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => <option key={s} value={s}>{t(STATUS_KEYS[s] as any)}</option>)}
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-b-border">
              <span className="text-xs text-dim">{t('page')} {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 text-dim hover:text-foreground disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 text-dim hover:text-foreground disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('create')}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('service')} *</label>
            <select required value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="input-base">
              <option value="">{t('select')}</option>
              {services?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('customer')} *</label>
            <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="input-base" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('contact')}</label>
            <input value={form.customerContact} onChange={(e) => setForm({ ...form, customerContact: e.target.value })} className="input-base" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('date')} *</label>
            <input type="datetime-local" required value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: new Date(e.target.value).toISOString() })} className="input-base" />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setCreateOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" className="flex-1" loading={createMut.isPending}>{t('create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
