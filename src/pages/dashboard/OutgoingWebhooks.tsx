import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Webhook, Plus, Trash2, Edit2, Play, CheckCircle, XCircle, Copy, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { outgoingWebhooksApi, OutgoingWebhook } from '../../api/outgoing-webhooks.api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

const ALL_EVENTS = [
  { value: 'BOOKING_CREATED', label: 'Booking Created', color: 'text-emerald-500' },
  { value: 'BOOKING_STATUS_CHANGED', label: 'Booking Status Changed', color: 'text-blue-500' },
  { value: 'CONVERSATION_NEW', label: 'New Conversation', color: 'text-violet-500' },
  { value: 'REVIEW_RECEIVED', label: 'Review Received', color: 'text-amber-500' },
];

const EMPTY_FORM = { name: '', url: '', secret: '', events: [] as string[] };

export default function OutgoingWebhooks() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<OutgoingWebhook | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showSecret, setShowSecret] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OutgoingWebhook | null>(null);

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['outgoing-webhooks'],
    queryFn: outgoingWebhooksApi.list,
  });

  const createMut = useMutation({
    mutationFn: () => outgoingWebhooksApi.create({ name: form.name, url: form.url, secret: form.secret || undefined, events: form.events }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['outgoing-webhooks'] }); toast.success('Webhook created!'); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: () => outgoingWebhooksApi.update(editing!.id, { name: form.name, url: form.url, secret: form.secret || undefined, events: form.events }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['outgoing-webhooks'] }); toast.success('Webhook updated!'); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => outgoingWebhooksApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['outgoing-webhooks'] }); toast.success('Webhook deleted'); setDeleteTarget(null); },
  });

  const testMut = useMutation({
    mutationFn: (id: string) => outgoingWebhooksApi.test(id),
    onSuccess: (res) => {
      if (res.ok) toast.success(`Test successful! Status: ${res.status}`);
      else toast.error(`Test failed. Status: ${res.status}`);
      qc.invalidateQueries({ queryKey: ['outgoing-webhooks'] });
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      outgoingWebhooksApi.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outgoing-webhooks'] }),
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (wh: OutgoingWebhook) => {
    setEditing(wh);
    setForm({ name: wh.name, url: wh.url, secret: wh.secret ?? '', events: wh.events });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const toggleEvent = (ev: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter((e) => e !== ev) : [...f.events, ev],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outgoing Webhooks</h1>
          <p className="text-sm text-muted mt-1">Connect Convly to Zapier, Make.com, n8n, or any custom endpoint.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Webhook
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Spinner /></div>
      ) : webhooks.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Webhook className="w-10 h-10 text-dim mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No webhooks yet</h3>
          <p className="text-sm text-muted mb-4">Connect Convly to external tools via webhooks</p>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Your First Webhook</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <motion.div key={wh.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${wh.isActive ? 'bg-emerald-500' : 'bg-dim'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{wh.name}</span>
                  {wh.lastStatus && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${wh.lastStatus < 300 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {wh.lastStatus}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted truncate">{wh.url}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {wh.events.map((ev) => {
                    const evDef = ALL_EVENTS.find((e) => e.value === ev);
                    return (
                      <span key={ev} className={`text-[10px] px-2 py-0.5 rounded-full bg-surface ${evDef?.color ?? 'text-muted'}`}>
                        {evDef?.label ?? ev}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleMut.mutate({ id: wh.id, isActive: !wh.isActive })}
                  className={`p-1.5 rounded-lg transition-colors text-xs font-medium ${wh.isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-dim hover:bg-surface'}`}
                  title={wh.isActive ? 'Disable' : 'Enable'}
                >
                  {wh.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => testMut.mutate(wh.id)}
                  className="p-1.5 text-dim hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Send test"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => openEdit(wh)} className="p-1.5 text-dim hover:text-foreground hover:bg-surface rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteTarget(wh)} className="p-1.5 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={closeModal} title={editing ? 'Edit Webhook' : 'Add Webhook'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted block mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="My Zapier Webhook"
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1.5">Endpoint URL</label>
            <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://hooks.zapier.com/..."
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1.5">
              Signing Secret <span className="text-dim">(optional)</span>
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={form.secret}
                onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
                placeholder="Used to verify webhook authenticity"
                className="w-full px-3 py-2 pr-10 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button onClick={() => setShowSecret((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-foreground">
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-2">Events to listen for</label>
            <div className="space-y-2">
              {ALL_EVENTS.map((ev) => (
                <label key={ev.value} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.events.includes(ev.value)} onChange={() => toggleEvent(ev.value)}
                    className="w-4 h-4 rounded accent-blue-500" />
                  <span className={`text-sm ${ev.color}`}>{ev.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={closeModal}>Cancel</Button>
            <Button className="flex-1"
              loading={createMut.isPending || updateMut.isPending}
              onClick={() => editing ? updateMut.mutate() : createMut.mutate()}
              disabled={!form.name || !form.url || form.events.length === 0}
            >
              {editing ? 'Update' : 'Create'} Webhook
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Webhook" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>?</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={deleteMut.isPending}
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
