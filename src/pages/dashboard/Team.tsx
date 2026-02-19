import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Crown, User } from 'lucide-react';
import { tenantApi } from '../../api/tenant.api';
import Spinner from '../../components/ui/Spinner';

export default function Team() {
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: tenantApi.getMembers,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-white/40 text-sm mt-1">
          {Array.isArray(members) ? members.length : 0} member{members?.length !== 1 ? 's' : ''} in your workspace
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !members?.length ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30">No team members yet.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
          {members?.map((m: any, i: number) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {m.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.email}
                </div>
                <div className="text-xs text-white/30 truncate">{m.email}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {m.role === 'TENANT_OWNER' ? (
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    <Crown className="w-3 h-3" /> Owner
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-white/40 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    <User className="w-3 h-3" /> Member
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
