import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Phone, ChevronLeft, ChevronRight, Star, CheckCircle, MapPin } from 'lucide-react';
import { api } from '../api/client';
import dayjs from 'dayjs';
import Spinner from '../components/ui/Spinner';

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  aiSettings: { businessDesc: string | null; industry: string | null } | null;
  services: { id: string; name: string; description: string | null; durationMinutes: number; price: string | null; currency: string }[];
  reviews: { id: string; customerName: string; rating: number; comment: string | null; createdAt: string }[];
  avgRating: number;
}

const publicApi = {
  getBusiness: (slug: string): Promise<BusinessData> =>
    api.get(`/public/b/${slug}`).then((r) => r.data),
  getSlots: (slug: string, serviceId: string, date: string): Promise<{ slots: string[] }> =>
    api.get(`/public/b/${slug}/slots`, { params: { serviceId, date } }).then((r) => r.data),
  book: (slug: string, data: object) =>
    api.post(`/public/b/${slug}/book`, data).then((r) => r.data),
  submitReview: (slug: string, data: object) =>
    api.post(`/public/b/${slug}/review`, data).then((r) => r.data),
};

type Step = 'service' | 'date' | 'slot' | 'details' | 'confirm' | 'success';

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<BusinessData['services'][0] | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', notes: '' });
  const [bookedId, setBookedId] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(dayjs());

  const { data: business, isLoading } = useQuery({
    queryKey: ['public-business', slug],
    queryFn: () => publicApi.getBusiness(slug!),
    enabled: !!slug,
  });

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['public-slots', slug, selectedService?.id, selectedDate],
    queryFn: () => publicApi.getSlots(slug!, selectedService!.id, selectedDate),
    enabled: !!slug && !!selectedService && step === 'slot',
  });

  const bookMut = useMutation({
    mutationFn: () => publicApi.book(slug!, {
      serviceId: selectedService!.id,
      customerName: form.name,
      customerContact: form.contact,
      startsAt: selectedSlot,
      notes: form.notes || undefined,
    }),
    onSuccess: (data) => {
      setBookedId(data.id);
      setStep('success');
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <Spinner />
    </div>
  );

  if (!business) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Business not found</h2>
        <p className="text-muted text-sm">This booking page doesn't exist or has been deactivated.</p>
      </div>
    </div>
  );

  // Calendar helpers
  const daysInMonth = calMonth.daysInMonth();
  const firstDay = calMonth.startOf('month').day();
  const today = dayjs();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
              {business.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-foreground">{business.name}</h1>
              {business.avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-muted">{business.avgRating} · {business.reviews.length} reviews</span>
                </div>
              )}
            </div>
          </div>
          {business.aiSettings?.businessDesc && (
            <p className="text-sm text-muted mt-2">{business.aiSettings.businessDesc}</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* Step: Select Service */}
          {step === 'service' && (
            <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-foreground mb-4">Choose a Service</h2>
              <div className="space-y-3">
                {business.services.map((svc) => (
                  <button key={svc.id} onClick={() => { setSelectedService(svc); setStep('date'); }}
                    className="w-full bg-card border border-border rounded-2xl p-4 text-left hover:border-blue-500/40 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground group-hover:text-blue-500 transition-colors">{svc.name}</div>
                        {svc.description && <div className="text-sm text-muted mt-0.5">{svc.description}</div>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Clock className="w-3 h-3" /> {svc.durationMinutes} min
                          </span>
                          {svc.price && (
                            <span className="text-xs font-medium text-foreground">
                              {svc.currency} {svc.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dim group-hover:text-blue-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Reviews */}
              {business.reviews.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-foreground mb-3">What customers say</h3>
                  <div className="space-y-3">
                    {business.reviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                            {r.customerName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{r.customerName}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-dim'}`} />)}
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-muted">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Select Date */}
          {step === 'date' && (
            <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-lg font-bold text-foreground mb-1">Select a Date</h2>
              <p className="text-sm text-muted mb-4">{selectedService?.name}</p>

              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCalMonth((m) => m.subtract(1, 'month'))} className="p-1.5 hover:bg-surface rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4 text-muted" />
                  </button>
                  <span className="font-medium text-foreground text-sm">{calMonth.format('MMMM YYYY')}</span>
                  <button onClick={() => setCalMonth((m) => m.add(1, 'month'))} className="p-1.5 hover:bg-surface rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                    <div key={d} className="text-center text-[11px] text-dim font-medium py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const date = calMonth.date(i + 1);
                    const dateStr = date.format('YYYY-MM-DD');
                    const isPast = date.isBefore(today, 'day');
                    const isSelected = dateStr === selectedDate;
                    const isToday = date.isSame(today, 'day');
                    return (
                      <button key={i} disabled={isPast}
                        onClick={() => { setSelectedDate(dateStr); setStep('slot'); }}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                          isSelected ? 'bg-blue-500 text-white' :
                          isToday ? 'border border-blue-500 text-blue-500' :
                          isPast ? 'text-dim cursor-not-allowed' :
                          'hover:bg-surface text-foreground'
                        }`}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Select Slot */}
          {step === 'slot' && (
            <motion.div key="slot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep('date')} className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-lg font-bold text-foreground mb-1">Available Times</h2>
              <p className="text-sm text-muted mb-4">{dayjs(selectedDate).format('dddd, MMMM D, YYYY')}</p>

              {loadingSlots ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : !slotsData?.slots.length ? (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 text-dim mx-auto mb-3" />
                  <p className="text-muted text-sm">No available slots on this day.</p>
                  <button onClick={() => setStep('date')} className="mt-3 text-sm text-blue-500 hover:underline">Choose another date</button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotsData.slots.map((slot) => (
                    <button key={slot} onClick={() => { setSelectedSlot(slot); setStep('details'); }}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        selectedSlot === slot
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-card border-border text-foreground hover:border-blue-500/40'
                      }`}>
                      {dayjs(slot).format('h:mm A')}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Customer Details */}
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep('slot')} className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-lg font-bold text-foreground mb-4">Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Phone or Email *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                    <input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                      placeholder="+1 234 567 8900 or email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Notes <span className="text-dim">(optional)</span></label>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special requests or notes..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
                </div>

                {/* Summary */}
                <div className="bg-surface rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Service</span>
                    <span className="font-medium text-foreground">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Date & Time</span>
                    <span className="font-medium text-foreground">{dayjs(selectedSlot).format('MMM D, h:mm A')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Duration</span>
                    <span className="font-medium text-foreground">{selectedService?.durationMinutes} min</span>
                  </div>
                  {selectedService?.price && (
                    <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                      <span className="text-muted">Price</span>
                      <span className="font-bold text-foreground">{selectedService.currency} {selectedService.price}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => bookMut.mutate()}
                  disabled={!form.name || !form.contact || bookMut.isPending}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookMut.isPending ? <><Spinner size="sm" /> Booking...</> : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
              <p className="text-muted text-sm mb-6">
                Your appointment has been booked successfully. You'll receive a reminder before your appointment.
              </p>
              <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Service</span>
                  <span className="font-medium text-foreground">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Date & Time</span>
                  <span className="font-medium text-foreground">{dayjs(selectedSlot).format('dddd, MMM D · h:mm A')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Name</span>
                  <span className="font-medium text-foreground">{form.name}</span>
                </div>
              </div>
              <button onClick={() => { setStep('service'); setSelectedService(null); setSelectedSlot(null); setForm({ name: '', contact: '', notes: '' }); }}
                className="text-sm text-blue-500 hover:underline">
                Book another appointment
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
