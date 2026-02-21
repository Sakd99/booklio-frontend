import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Clock, DollarSign, Package,
  Calendar, MessageSquare, ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { servicesApi, type CreateServicePayload, type ServiceType } from '../../api/services.api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DEFAULT_AVAIL = [1, 2, 3, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00' }));

const emptyForm = (type: ServiceType = 'BOOKING'): CreateServicePayload => ({
  type,
  name: '',
  description: '',
  durationMinutes: 60,
  bufferMinutes: 10,
  price: 0,
  currency: 'USD',
  availabilities: type === 'BOOKING' ? DEFAULT_AVAIL : [],
});

export default function Services() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<CreateServicePayload>(emptyForm());

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.list,
  });

  const createMut = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setModal(null); toast.success('Service created!'); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setModal(null); toast.success('Service updated!'); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Service deactivated'); },
  });

  const openCreate = () => { setForm(emptyForm()); setEditing(null); setModal('create'); };
  const openEdit = (svc: any) => {
    setForm({
      type: svc.type ?? 'BOOKING',
      name: svc.name,
      description: svc.description ?? '',
      durationMinutes: svc.durationMinutes,
      bufferMinutes: svc.bufferMinutes,
      price: svc.price,
      currency: svc.currency,
      availabilities: svc.availabilities ?? DEFAULT_AVAIL,
    });
    setEditing(svc);
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.type === 'PRODUCT') {
      payload.durationMinutes = 0;
      payload.bufferMinutes = 0;
      payload.availabilities = [];
    }
    if (modal === 'create') createMut.mutate(payload);
    else if (editing) updateMut.mutate({ id: editing.id, data: payload });
  };

  const toggleDay = (day: number) => {
    const avails = form.availabilities ?? [];
    const exists = avails.find((a) => a.dayOfWeek === day);
    setForm((f) => ({
      ...f,
      availabilities: exists
        ? avails.filter((a) => a.dayOfWeek !== day)
        : [...avails, { dayOfWeek: day, startTime: '09:00', endTime: '17:00' }],
    }));
  };

  const isBooking = form.type !== 'PRODUCT';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            {t('servicesTitle')}
          </h1>
          <p className="text-muted text-sm mt-1.5">{t('servicesDesc')}</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>{t('addService')}</Button>
      </div>

      {/* Capabilities summary */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3.5 border border-blue-500/20 bg-blue-500/5">
          <div className="text-blue-500 mb-1.5"><Calendar className="w-4 h-4" /></div>
          <div className="text-xs font-semibold text-foreground">{t('typeBooking')}</div>
          <div className="text-[10px] text-muted mt-0.5 line-clamp-1">{t('typeBookingDesc')}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl p-3.5 border border-emerald-500/20 bg-emerald-500/5">
          <div className="text-emerald-500 mb-1.5"><ShoppingBag className="w-4 h-4" /></div>
          <div className="text-xs font-semibold text-foreground">{t('typeProduct')}</div>
          <div className="text-[10px] text-muted mt-0.5 line-clamp-1">{t('typeProductDesc')}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl p-3.5 border border-violet-500/20 bg-violet-500/5">
          <div className="text-violet-500 mb-1.5"><MessageSquare className="w-4 h-4" /></div>
          <div className="text-xs font-semibold text-foreground">AI DM</div>
          <div className="text-[10px] text-muted mt-0.5 line-clamp-1">{t('autoReplyOn')}</div>
        </motion.div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : services?.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-16 text-center border border-b-border">
          <Package className="w-12 h-12 text-dim mx-auto mb-4" />
          <p className="text-muted font-medium">{t('noServices')}</p>
          <p className="text-dim text-sm mt-1 max-w-md mx-auto">{t('createFirstService')}</p>
          <Button className="mt-4" onClick={openCreate} icon={<Plus className="w-4 h-4" />}>{t('addService')}</Button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services?.map((svc: any, i: number) => {
            const isProduct = svc.type === 'PRODUCT';
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-5 border border-b-border transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isProduct ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                      {isProduct
                        ? <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        : <Calendar className="w-4 h-4 text-blue-500" />
                      }
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">{svc.name}</h3>
                      {svc.description && <p className="text-xs text-muted mt-0.5 line-clamp-2">{svc.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 ms-2 flex-shrink-0">
                    <button onClick={() => openEdit(svc)} className="p-1.5 text-dim hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if (confirm(t('deleteService'))) deleteMut.mutate(svc.id); }} className="p-1.5 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {/* Type badge + price */}
                <div className="flex items-center gap-3 text-sm mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isProduct ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {isProduct ? t('typeProduct') : t('typeBooking')}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-500 font-medium text-sm">
                    <DollarSign className="w-3.5 h-3.5" />{svc.price} {svc.currency}
                  </span>
                </div>

                {/* Booking-specific info */}
                {!isProduct && (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                      <Clock className="w-3 h-3" /> {svc.durationMinutes}min
                    </div>
                    <div className="flex gap-1">
                      {DAY_KEYS.map((d, idx) => {
                        const active = svc.availabilities?.some((a: any) => a.dayOfWeek === idx);
                        return <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded ${active ? 'bg-blue-500/20 text-blue-500' : 'bg-surface text-dim'}`}>{t(d)}</span>;
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'create' ? t('addService') : t('editService')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm text-muted mb-2">{t('serviceType')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'BOOKING', availabilities: form.availabilities?.length ? form.availabilities : DEFAULT_AVAIL })}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                  isBooking
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-sm'
                    : 'bg-surface border-b-border hover:bg-surface-hover'
                }`}
              >
                <Calendar className={`w-5 h-5 ${isBooking ? 'text-blue-500' : 'text-dim'}`} />
                <div>
                  <div className={`text-sm font-semibold ${isBooking ? 'text-blue-500' : 'text-foreground'}`}>{t('typeBooking')}</div>
                  <div className="text-[10px] text-muted">{t('typeBookingDesc')}</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'PRODUCT' })}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                  !isBooking
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm'
                    : 'bg-surface border-b-border hover:bg-surface-hover'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 ${!isBooking ? 'text-emerald-500' : 'text-dim'}`} />
                <div>
                  <div className={`text-sm font-semibold ${!isBooking ? 'text-emerald-500' : 'text-foreground'}`}>{t('typeProduct')}</div>
                  <div className="text-[10px] text-muted">{t('typeProductDesc')}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-muted mb-1.5">{t('serviceName')} *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base"
                placeholder={isBooking ? 'e.g. Premium Haircut' : 'e.g. Hair Care Kit'}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-muted mb-1.5">{t('description')}</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-base" />
            </div>

            {/* Booking-only fields */}
            {isBooking && (
              <>
                <div>
                  <label className="block text-sm text-muted mb-1.5">{t('duration')}</label>
                  <input type="number" min={15} required value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })} className="input-base" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1.5">{t('buffer')}</label>
                  <input type="number" min={0} value={form.bufferMinutes} onChange={(e) => setForm({ ...form, bufferMinutes: +e.target.value })} className="input-base" />
                </div>
              </>
            )}

            {/* Price + currency (always shown) */}
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('price')}</label>
              <input type="number" min={0} step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="input-base" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('currency')}</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input-base">
                {['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Available days (booking only) */}
          {isBooking && (
            <div>
              <label className="block text-sm text-muted mb-2">{t('availableDays')}</label>
              <div className="flex gap-2 flex-wrap">
                {DAY_KEYS.map((d, idx) => {
                  const active = (form.availabilities ?? []).some((a) => a.dayOfWeek === idx);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                          : 'bg-surface text-dim border border-b-border hover:border-muted'
                      }`}
                    >
                      {t(d)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(null)}>{t('cancel')}</Button>
            <Button type="submit" className="flex-1" loading={createMut.isPending || updateMut.isPending}>{modal === 'create' ? t('create') : t('save')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
