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
import { statusBadge } from '../../components/ui/Badge';

const STATUSES = ['', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function Bookings() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateBookingPayload>({
    serviceId: '',
    customerName: '',
    customerContact: '',
    startsAt: '',
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', page, statusFilter],
    queryFn: () => bookingsApi.list({ page, limit: 15, status: statusFilter || undefined }),
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.list,
  });

  const createMut = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setCreateOpen(false);
      toast.success('Booking created!');
      setForm({ serviceId: '', customerName: '', customerContact: '', startsAt: '', notes: '' });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.error;
      toast.error(msg ?? 'Booking failed');
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Status updated');
    },
  });

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-white/40 text-sm mt-1">
            {data?.total ?? 0} total appointments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/30" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-blue-500/50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-gray-900">
                  {s || 'All statuses'}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            New booking
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : data?.appointments?.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-white/5">
          <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30">No bookings found.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-white/5 overflow-hidden"
        >
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Customer', 'Service', 'Date & Time', 'Contact', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.appointments?.map((bk: any) => (
                  <motion.tr
                    key={bk.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-sm text-white font-medium">{bk.customerName}</td>
                    <td className="px-4 py-3.5 text-sm text-white/50">{bk.service?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-white/50">
                      {new Date(bk.startsAt).toLocaleDateString()} {' '}
                      {new Date(bk.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white/40">{bk.customerContact}</td>
                    <td className="px-4 py-3.5">{statusBadge(bk.status)}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={bk.status}
                        onChange={(e) => statusMut.mutate({ id: bk.id, status: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/60 text-xs focus:outline-none"
                      >
                        {['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => (
                          <option key={s} value={s} className="bg-gray-900">{s}</option>
                        ))}
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <span className="text-xs text-white/30">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 text-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 text-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Create booking modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Booking">
        <form
          onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Service *</label>
            <select
              required
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
            >
              <option value="" className="bg-gray-900">Select service...</option>
              {services?.map((s: any) => (
                <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Customer name *</label>
            <input
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="Mohammed Al-Hassan"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Contact (phone/IG/TT)</label>
            <input
              value={form.customerContact}
              onChange={(e) => setForm({ ...form, customerContact: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="+966 5xx xxx xxxx"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Date & time *</label>
            <input
              type="datetime-local"
              required
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: new Date(e.target.value).toISOString() })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              placeholder="Optional notes..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={createMut.isPending}>
              Create booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
