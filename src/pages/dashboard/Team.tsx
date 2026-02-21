import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Crown, User } from 'lucide-react';
import { tenantApi } from '../../api/tenant.api';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';

export default function Team() {
  const { t } = useI18n();
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: tenantApi.getMembers,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('teamTitle')}</h1>
        <p className="text-muted text-sm mt-1">{t('teamDesc')}</p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !members?.length ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-b-border">
          <Users className="w-12 h-12 text-dim mx-auto mb-4" />
          <p className="text-muted">{t('noTeamMembers')}</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-b-border divide-y divide-b-border overflow-hidden">
          {members?.map((m: any, i: number) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {m.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.email}
                </div>
                <div className="text-xs text-muted truncate">{m.email}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {m.role === 'TENANT_OWNER' ? (
                  <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    <Crown className="w-3 h-3" /> {t('owner')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted bg-surface border border-b-border px-2.5 py-1 rounded-full">
                    <User className="w-3 h-3" /> {t('member')}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
