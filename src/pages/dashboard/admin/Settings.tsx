import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Settings2, Database, Key, Globe, Cpu, Shield, Save, Eye, EyeOff,
  ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../../api/admin.api';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { useI18n } from '../../../store/i18n.store';

interface SettingItem {
  id: string;
  key: string;
  value: string;
  group: string;
  label: string | null;
  encrypted: boolean;
}

const SETTING_GROUPS = [
  { id: 'general', icon: <Settings2 className="w-4 h-4" />, label: 'General' },
  { id: 'database', icon: <Database className="w-4 h-4" />, label: 'Database' },
  { id: 'channels', icon: <Globe className="w-4 h-4" />, label: 'Channels' },
  { id: 'ai', icon: <Cpu className="w-4 h-4" />, label: 'AI' },
  { id: 'security', icon: <Shield className="w-4 h-4" />, label: 'Security' },
];

const ENV_DEFAULTS: { key: string; label: string; group: string; encrypted: boolean }[] = [
  // Database
  { key: 'DATABASE_URL', label: 'Database URL', group: 'database', encrypted: true },
  { key: 'DB_USER', label: 'Database User', group: 'database', encrypted: false },
  { key: 'DB_PASSWORD', label: 'Database Password', group: 'database', encrypted: true },
  { key: 'DB_NAME', label: 'Database Name', group: 'database', encrypted: false },
  // General
  { key: 'REDIS_HOST', label: 'Redis Host', group: 'general', encrypted: false },
  { key: 'REDIS_PORT', label: 'Redis Port', group: 'general', encrypted: false },
  { key: 'API_URL', label: 'API URL', group: 'general', encrypted: false },
  { key: 'WEBHOOKS_URL', label: 'Webhooks URL', group: 'general', encrypted: false },
  { key: 'FRONTEND_URL', label: 'Frontend URL', group: 'general', encrypted: false },
  { key: 'API_PORT', label: 'API Port', group: 'general', encrypted: false },
  { key: 'WEBHOOKS_PORT', label: 'Webhooks Port', group: 'general', encrypted: false },
  { key: 'NODE_ENV', label: 'Environment', group: 'general', encrypted: false },
  // Security
  { key: 'JWT_ACCESS_SECRET', label: 'JWT Access Secret', group: 'security', encrypted: true },
  { key: 'JWT_REFRESH_SECRET', label: 'JWT Refresh Secret', group: 'security', encrypted: true },
  { key: 'JWT_ACCESS_EXPIRES_IN', label: 'Access Token Expiry', group: 'security', encrypted: false },
  { key: 'JWT_REFRESH_EXPIRES_IN', label: 'Refresh Token Expiry', group: 'security', encrypted: false },
  { key: 'TOKEN_ENCRYPTION_KEY', label: 'Token Encryption Key', group: 'security', encrypted: true },
  { key: 'INTERNAL_API_KEY', label: 'Internal API Key', group: 'security', encrypted: true },
  // Channels
  { key: 'INSTAGRAM_APP_ID', label: 'Instagram App ID', group: 'channels', encrypted: false },
  { key: 'INSTAGRAM_APP_SECRET', label: 'Instagram App Secret', group: 'channels', encrypted: true },
  { key: 'META_APP_ID', label: 'Meta App ID', group: 'channels', encrypted: false },
  { key: 'META_APP_SECRET', label: 'Meta App Secret', group: 'channels', encrypted: true },
  { key: 'WHATSAPP_CONFIG_ID', label: 'WhatsApp Config ID', group: 'channels', encrypted: false },
  { key: 'TIKTOK_CLIENT_KEY', label: 'TikTok Client Key', group: 'channels', encrypted: false },
  { key: 'TIKTOK_CLIENT_SECRET', label: 'TikTok Client Secret', group: 'channels', encrypted: true },
  { key: 'CHANNEL_INSTAGRAM', label: 'Instagram Enabled', group: 'channels', encrypted: false },
  { key: 'CHANNEL_WHATSAPP', label: 'WhatsApp Enabled', group: 'channels', encrypted: false },
  { key: 'CHANNEL_TELEGRAM', label: 'Telegram Enabled', group: 'channels', encrypted: false },
  { key: 'CHANNEL_MESSENGER', label: 'Messenger Enabled', group: 'channels', encrypted: false },
  { key: 'CHANNEL_TIKTOK', label: 'TikTok Enabled', group: 'channels', encrypted: false },
  // AI
  { key: 'LLMAPI_BASE_URL', label: 'LLM API Base URL', group: 'ai', encrypted: false },
  { key: 'LLMAPI_API_KEY', label: 'LLM API Key', group: 'ai', encrypted: true },
  { key: 'LLMAPI_MODEL', label: 'LLM Model', group: 'ai', encrypted: false },
  { key: 'LLMAPI_MAX_TOKENS', label: 'Max Tokens', group: 'ai', encrypted: false },
  { key: 'LLMAPI_TEMPERATURE', label: 'Temperature', group: 'ai', encrypted: false },
  // Rate Limiting
  { key: 'THROTTLE_TTL', label: 'Rate Limit TTL (ms)', group: 'general', encrypted: false },
  { key: 'THROTTLE_LIMIT', label: 'Rate Limit Max Requests', group: 'general', encrypted: false },
];

const isChannelToggle = (key: string) => key.startsWith('CHANNEL_');

export default function AdminSettings() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [activeGroup, setActiveGroup] = useState('general');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
  });

  // Initialize form values from settings
  useEffect(() => {
    if (settings) {
      const vals: Record<string, string> = {};
      settings.forEach((s: SettingItem) => {
        vals[s.key] = s.value;
      });
      // Add defaults for missing keys
      ENV_DEFAULTS.forEach((d) => {
        if (!(d.key in vals)) {
          vals[d.key] = isChannelToggle(d.key) ? 'true' : '';
        }
      });
      setFormValues(vals);
    }
  }, [settings]);

  const saveMut = useMutation({
    mutationFn: (group: string) => {
      const groupSettings = ENV_DEFAULTS.filter((d) => d.group === group);
      const toSave = groupSettings
        .filter((d) => formValues[d.key] !== undefined)
        .map((d) => ({
          key: d.key,
          value: formValues[d.key] || '',
          group: d.group,
          label: d.label,
          encrypted: d.encrypted,
        }));
      return adminApi.upsertSettings(toSave);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success(t('settingsSaved'));
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const groupSettings = ENV_DEFAULTS.filter((d) => d.group === activeGroup);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('adminSettings')}</h1>
        <p className="text-muted text-sm mt-1">{t('adminSettingsDesc')}</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {SETTING_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeGroup === g.id
                  ? 'bg-violet-500/10 text-violet-500 border border-violet-500/20'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {g.icon}
              {g.label}
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <div className="flex-1">
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 border border-b-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground capitalize">
                {SETTING_GROUPS.find((g) => g.id === activeGroup)?.label}
              </h2>
              <Button
                onClick={() => saveMut.mutate(activeGroup)}
                loading={saveMut.isPending}
                icon={<Save className="w-4 h-4" />}
                size="sm"
              >
                {t('save')}
              </Button>
            </div>

            <div className="space-y-4">
              {groupSettings.map((setting) => {
                const isToggle = isChannelToggle(setting.key);
                const val = formValues[setting.key] ?? '';
                const isOn = val === 'true' || val === '1';

                if (isToggle) {
                  return (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface border border-b-border"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{setting.label}</div>
                        <div className="text-xs text-muted">{setting.key}</div>
                      </div>
                      <button
                        onClick={() =>
                          setFormValues((v) => ({ ...v, [setting.key]: isOn ? 'false' : 'true' }))
                        }
                        className="transition-colors"
                      >
                        {isOn ? (
                          <ToggleRight className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-muted" />
                        )}
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={setting.key}>
                    <label className="flex items-center gap-2 text-sm text-muted mb-1.5">
                      {setting.label}
                      {setting.encrypted && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
                          encrypted
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={setting.encrypted && !showSecrets[setting.key] ? 'password' : 'text'}
                        value={val}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, [setting.key]: e.target.value }))
                        }
                        className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono"
                        placeholder={setting.key}
                      />
                      {setting.encrypted && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowSecrets((s) => ({ ...s, [setting.key]: !s[setting.key] }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                        >
                          {showSecrets[setting.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-dim mt-0.5 font-mono">{setting.key}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
