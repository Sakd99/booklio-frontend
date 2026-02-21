import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Shield, ShieldCheck, Trash2,
  Crown, Edit, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { teamApi, type PermissionPayload } from '../../api/team.api';
import { tenantApi } from '../../api/tenant.api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';
import { useAuthStore } from '../../store/auth.store';

const RESOURCES = [
  'services',
  'bookings',
  'channels',
  'conversations',
  'ai_settings',
  'team',
] as const;

type Resource = (typeof RESOURCES)[number];

const RESOURCE_LABEL_KEYS: Record<Resource, string> = {
  services: 'resourceServices',
  bookings: 'resourceBookings',
  channels: 'resourceChannels',
  conversations: 'resourceConversations',
  ai_settings: 'resourceAiSettings',
  team: 'resourceTeam',
};

const defaultPermissions = (): PermissionPayload[] =>
  RESOURCES.map((r) => ({ resource: r, canView: true, canEdit: false }));

interface InviteForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  permissions: PermissionPayload[];
}

const emptyInvite = (): InviteForm => ({
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  permissions: defaultPermissions(),
});

export default function Team() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === 'TENANT_OWNER';

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>(emptyInvite());
  const [showPassword, setShowPassword] = useState(false);

  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editPerms, setEditPerms] = useState<PermissionPayload[]>([]);

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removingMember, setRemovingMember] = useState<any>(null);

  // --- Queries ---
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: teamApi.listMembers,
  });

  const { data: profile } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: tenantApi.getProfile,
  });

  const plan = profile?.subscriptions?.[0]?.plan;
  const maxMembers = plan?.maxTeamMembers ?? 0;
  const currentCount = members?.length ?? 0;
  const isFull = maxMembers > 0 && currentCount >= maxMembers;

  // --- Mutations ---
  const inviteMut = useMutation({
    mutationFn: teamApi.invite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      setInviteOpen(false);
      setInviteForm(emptyInvite());
      toast.success(t('memberInvited'));
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to invite member'),
  });

  const removeMut = useMutation({
    mutationFn: teamApi.removeMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      setRemoveModalOpen(false);
      setRemovingMember(null);
      toast.success(t('memberRemoved'));
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to remove member'),
  });

  const updatePermsMut = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: PermissionPayload[] }) =>
      teamApi.updatePermissions(id, permissions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      setPermModalOpen(false);
      setEditingMember(null);
      toast.success(t('permissionsUpdated'));
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to update permissions'),
  });

  // --- Handlers ---
  const openInvite = () => {
    setInviteForm(emptyInvite());
    setShowPassword(false);
    setInviteOpen(true);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMut.mutate({
      email: inviteForm.email,
      firstName: inviteForm.firstName,
      lastName: inviteForm.lastName,
      password: inviteForm.password,
      permissions: inviteForm.permissions,
    });
  };

  const openPermEditor = async (member: any) => {
    setEditingMember(member);
    try {
      const perms = await teamApi.getPermissions(member.id);
      const permsList: PermissionPayload[] = Array.isArray(perms) ? perms : perms?.permissions ?? [];
      // Ensure all resources present
      const merged = RESOURCES.map((r) => {
        const existing = permsList.find((p: PermissionPayload) => p.resource === r);
        return existing ?? { resource: r, canView: false, canEdit: false };
      });
      setEditPerms(merged);
    } catch {
      setEditPerms(defaultPermissions());
    }
    setPermModalOpen(true);
  };

  const handlePermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    updatePermsMut.mutate({ id: editingMember.id, permissions: editPerms });
  };

  const openRemoveConfirm = (member: any) => {
    setRemovingMember(member);
    setRemoveModalOpen(true);
  };

  const toggleInvitePerm = (resource: string, field: 'canView' | 'canEdit') => {
    setInviteForm((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) => {
        if (p.resource !== resource) return p;
        if (field === 'canEdit') {
          const newEdit = !p.canEdit;
          return { ...p, canEdit: newEdit, canView: newEdit ? true : p.canView };
        }
        const newView = !p.canView;
        return { ...p, canView: newView, canEdit: newView ? p.canEdit : false };
      }),
    }));
  };

  const toggleEditPerm = (resource: string, field: 'canView' | 'canEdit') => {
    setEditPerms((prev) =>
      prev.map((p) => {
        if (p.resource !== resource) return p;
        if (field === 'canEdit') {
          const newEdit = !p.canEdit;
          return { ...p, canEdit: newEdit, canView: newEdit ? true : p.canView };
        }
        const newView = !p.canView;
        return { ...p, canView: newView, canEdit: newView ? p.canEdit : false };
      }),
    );
  };

  // --- Permission grid renderer ---
  const renderPermGrid = (
    perms: PermissionPayload[],
    onToggle: (resource: string, field: 'canView' | 'canEdit') => void,
  ) => (
    <div className="space-y-2">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_80px_80px] gap-2 text-xs text-muted font-medium px-1">
        <span />
        <span className="text-center">{t('view')}</span>
        <span className="text-center">{t('edit')}</span>
      </div>
      {RESOURCES.map((resource) => {
        const perm = perms.find((p) => p.resource === resource);
        const canView = perm?.canView ?? false;
        const canEdit = perm?.canEdit ?? false;
        return (
          <div
            key={resource}
            className="grid grid-cols-[1fr_80px_80px] gap-2 items-center rounded-xl px-3 py-2.5 bg-surface border border-b-border"
          >
            <span className="text-sm font-medium text-foreground">
              {t(RESOURCE_LABEL_KEYS[resource] as any)}
            </span>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onToggle(resource, 'canView')}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  canView
                    ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                    : 'bg-surface text-dim border border-b-border hover:border-muted'
                }`}
              >
                {canView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onToggle(resource, 'canEdit')}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  canEdit
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : 'bg-surface text-dim border border-b-border hover:border-muted'
                }`}
              >
                {canEdit ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // --- Progress bar percentage ---
  const limitPct = maxMembers > 0 ? Math.min(100, (currentCount / maxMembers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            {t('teamTitle')}
          </h1>
          <p className="text-muted text-sm mt-1.5">{t('teamDesc')}</p>
        </div>
        {isOwner && (
          <Button
            onClick={openInvite}
            disabled={isFull}
            icon={<UserPlus className="w-4 h-4" />}
          >
            {isFull ? t('teamFull') : t('inviteMember')}
          </Button>
        )}
      </div>

      {/* Plan limit bar */}
      {maxMembers > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 border border-b-border"
        >
          <div className="flex justify-between text-sm mb-2">
            <span className="text-foreground font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              {t('teamMembers')}
            </span>
            <span className="text-muted">
              {currentCount} / {maxMembers}
            </span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${limitPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className={`h-full rounded-full bg-gradient-to-r ${
                limitPct >= 90 ? 'from-red-500 to-red-400' : 'from-blue-500 to-violet-500'
              }`}
            />
          </div>
        </motion.div>
      )}

      {/* Members list */}
      {isLoading ? (
        <Spinner />
      ) : !members?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-16 text-center border border-b-border"
        >
          <Users className="w-12 h-12 text-dim mx-auto mb-4" />
          <p className="text-muted font-medium">{t('noTeamMembers')}</p>
          {isOwner && (
            <Button className="mt-4" onClick={openInvite} icon={<UserPlus className="w-4 h-4" />}>
              {t('inviteMember')}
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="glass-card rounded-2xl border border-b-border divide-y divide-b-border overflow-hidden">
          {members.map((m: any, i: number) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {(m.firstName?.[0] || m.email?.[0] || '?').toUpperCase()}
              </div>

              {/* Name / email / last login */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.email}
                </div>
                <div className="text-xs text-muted truncate">{m.email}</div>
                {m.lastLoginAt && (
                  <div className="text-[10px] text-dim mt-0.5">
                    {t('lastLogin')}: {new Date(m.lastLoginAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Role badge */}
              <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
                {m.role === 'TENANT_OWNER' ? (
                  <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    <Crown className="w-3 h-3" /> {t('owner')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted bg-surface border border-b-border px-2.5 py-1 rounded-full">
                    <Shield className="w-3 h-3" /> {t('member')}
                  </span>
                )}
              </div>

              {/* Actions (owner only, not on self / other owners) */}
              {isOwner && m.role !== 'TENANT_OWNER' && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openPermEditor(m)}
                    className="p-1.5 text-dim hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title={t('editPermissions')}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openRemoveConfirm(m)}
                    className="p-1.5 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title={t('removeMember')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ========== Invite Modal ========== */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title={t('inviteMember')} size="lg">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('firstName')} *</label>
              <input
                required
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('lastName')} *</label>
              <input
                required
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                className="input-base"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('email')} *</label>
            <input
              required
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="input-base"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('password')} *</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={inviteForm.password}
                onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                className="input-base pe-10"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-dim hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm text-muted mb-2">{t('permissions')}</label>
            {renderPermGrid(inviteForm.permissions, toggleInvitePerm)}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setInviteOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" loading={inviteMut.isPending}>
              {t('inviteMember')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========== Permission Editor Modal ========== */}
      <Modal
        open={permModalOpen}
        onClose={() => setPermModalOpen(false)}
        title={`${t('editPermissions')} — ${editingMember?.firstName ?? editingMember?.email ?? ''}`}
        size="md"
      >
        <form onSubmit={handlePermSubmit} className="space-y-4">
          {renderPermGrid(editPerms, toggleEditPerm)}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setPermModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" loading={updatePermsMut.isPending}>
              {t('save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========== Remove Confirmation Modal ========== */}
      <Modal
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title={t('removeMember')}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {(removingMember?.firstName?.[0] || removingMember?.email?.[0] || '?').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {removingMember?.firstName && removingMember?.lastName
                  ? `${removingMember.firstName} ${removingMember.lastName}`
                  : removingMember?.email}
              </div>
              <div className="text-xs text-muted truncate">{removingMember?.email}</div>
            </div>
          </div>

          <p className="text-sm text-muted">{t('removeMemberConfirm')}</p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setRemoveModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              loading={removeMut.isPending}
              onClick={() => removingMember && removeMut.mutate(removingMember.id)}
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
