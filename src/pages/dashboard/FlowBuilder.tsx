import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Play, Pause, Bot, Clock,
  GitBranch, Calendar, Tag, Send, Variable,
  Zap, Hash, CircleStop, Radio, AlertTriangle,
  Trash2, X, ToggleLeft, ToggleRight, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { automationsApi } from '../../api/automations.api';
import { channelsApi } from '../../api/channels.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';

// ─── Node Definitions (hex colors for Whatsapio-style) ─────
const NODE_DEFS = [
  { type: 'trigger', labelKey: 'node_trigger', descKey: 'node_trigger_desc', Icon: Zap, color: '#3b82f6', cat: 'trigger' },
  { type: 'sendMessage', labelKey: 'node_sendMessage', descKey: 'node_sendMessage_desc', Icon: Send, color: '#10b981', cat: 'replies' },
  { type: 'aiStep', labelKey: 'node_aiStep', descKey: 'node_aiStep_desc', Icon: Bot, color: '#8b5cf6', cat: 'replies' },
  { type: 'condition', labelKey: 'node_condition', descKey: 'node_condition_desc', Icon: GitBranch, color: '#f59e0b', cat: 'logic' },
  { type: 'delay', labelKey: 'node_delay', descKey: 'node_delay_desc', Icon: Clock, color: '#9ca3af', cat: 'logic' },
  { type: 'createBooking', labelKey: 'node_createBooking', descKey: 'node_createBooking_desc', Icon: Calendar, color: '#ec4899', cat: 'actions' },
  { type: 'setVariable', labelKey: 'node_setVariable', descKey: 'node_setVariable_desc', Icon: Variable, color: '#06b6d4', cat: 'actions' },
  { type: 'tagUser', labelKey: 'node_tagUser', descKey: 'node_tagUser_desc', Icon: Tag, color: '#ef4444', cat: 'actions' },
  { type: 'endFlow', labelKey: 'node_endFlow', descKey: 'node_endFlow_desc', Icon: CircleStop, color: '#6b7280', cat: 'actions' },
];

const SIDEBAR_CATEGORIES = [
  { key: 'replies', labelKey: 'sidebarReplies' },
  { key: 'logic', labelKey: 'sidebarLogic' },
  { key: 'actions', labelKey: 'sidebarActions' },
];

const getMeta = (type?: string) => NODE_DEFS.find((n) => n.type === type) ?? NODE_DEFS[0];

function getNodeSummary(type: string | undefined, data: any, t: any): string {
  switch (type) {
    case 'sendMessage': return (data.message as string)?.slice(0, 40) || '';
    case 'aiStep': return (data.prompt as string)?.slice(0, 40) || '';
    case 'condition': return (data.condition as string)?.slice(0, 40) || '';
    case 'delay': {
      const val = data.delayValue ?? 5;
      const unit = data.delayUnit ?? 'minutes';
      const unitKey = `delay${unit.charAt(0).toUpperCase() + unit.slice(1)}`;
      return `${val} ${t(unitKey as any)}`;
    }
    case 'setVariable': return data.varName || '';
    case 'tagUser': return data.tag || '';
    case 'createBooking': return t('autoCreateBookingDesc');
    case 'endFlow': return t('flowEndsHere');
    default: return '';
  }
}

// ─── Trigger Node (colored border & header) ──────────
function TriggerNode({ data, selected }: { data: any; selected?: boolean }) {
  const { t } = useI18n();
  const meta = getMeta('trigger');
  const Icon = meta.Icon;

  return (
    <div
      className={`bg-[var(--color-card)] rounded-xl border-2 shadow-lg min-w-[220px] cursor-pointer transition-all ${
        selected ? 'ring-2 ring-blue-400/50 shadow-xl' : ''
      }`}
      style={{ borderColor: meta.color }}
    >
      <div
        className="px-4 py-3 rounded-t-[10px] flex items-center gap-2"
        style={{ backgroundColor: meta.color + '15' }}
      >
        <Icon className="h-5 w-5" style={{ color: meta.color }} />
        <span className="text-sm font-bold" style={{ color: meta.color }}>
          {t(meta.labelKey as any)}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-muted">{t('flowStartsHere')}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
    </div>
  );
}

// ─── Action Node (clean border, icon header, summary) ──
function ActionNode({ data, type, selected }: { data: any; type?: string; selected?: boolean }) {
  const { t } = useI18n();
  const meta = getMeta(type);
  const Icon = meta.Icon;
  const isCondition = type === 'condition';
  const summary = getNodeSummary(type, data, t);

  return (
    <div
      className={`bg-[var(--color-card)] rounded-xl border border-b-border shadow-md min-w-[200px] hover:shadow-lg transition-all cursor-pointer ${
        selected ? 'ring-2 ring-violet-400/50 shadow-xl' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
      <div className="px-4 py-3 flex items-center gap-2 border-b border-b-border/50">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: meta.color + '15' }}
        >
          <Icon className="h-4 w-4" style={{ color: meta.color }} />
        </div>
        <span className="text-sm font-semibold text-foreground">{t(meta.labelKey as any)}</span>
      </div>
      {summary && (
        <div className="px-4 py-2">
          <p className="text-xs text-muted truncate max-w-[180px]">{summary}</p>
        </div>
      )}
      {isCondition && (
        <div className="flex items-center justify-between px-4 pb-2 text-[10px]">
          <span className="text-emerald-500 font-medium">{t('conditionTrue')} →</span>
          <span className="text-red-500 font-medium">← {t('conditionFalse')}</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
      {isCondition && (
        <>
          <Handle type="source" position={Position.Right} id="true" className="!w-3 !h-3 !bg-emerald-500" />
          <Handle type="source" position={Position.Left} id="false" className="!w-3 !h-3 !bg-red-500" />
        </>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  sendMessage: ActionNode,
  aiStep: ActionNode,
  condition: ActionNode,
  delay: ActionNode,
  createBooking: ActionNode,
  setVariable: ActionNode,
  tagUser: ActionNode,
  endFlow: ActionNode,
};

// ─── Node Editor (Right Panel) ──────────────────────
function NodeEditor({
  node,
  onUpdate,
  onDelete,
  onClose,
}: {
  node: Node;
  onUpdate: (field: string, value: any) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const meta = getMeta(node.type);
  const Icon = meta.Icon;
  const isTrigger = node.type === 'trigger';

  const inputCls =
    'w-full text-sm border border-b-border rounded-xl bg-surface px-3 py-2 mt-1.5 text-foreground placeholder:text-muted/50 focus:ring-2 focus:ring-violet-500/30 focus:outline-none';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-b-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: meta.color + '15' }}
          >
            <Icon className="h-4 w-4" style={{ color: meta.color }} />
          </div>
          <h3 className="text-sm font-bold text-foreground">{t(meta.labelKey as any)}</h3>
        </div>
        <div className="flex items-center gap-1">
          {!isTrigger && (
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
              title={t('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface rounded-lg text-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isTrigger && (
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-muted flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              {t('flowStartsHere')}
            </p>
          </div>
        )}

        {node.type === 'sendMessage' && (
          <div>
            <label className="text-xs font-medium text-muted">{t('messagePlaceholder')}</label>
            <textarea
              value={(node.data.message as string) ?? ''}
              onChange={(e) => onUpdate('message', e.target.value)}
              rows={5}
              placeholder={t('messagePlaceholder')}
              className={`${inputCls} resize-none`}
            />
          </div>
        )}

        {node.type === 'aiStep' && (
          <div>
            <label className="text-xs font-medium text-muted">{t('aiPromptPlaceholder')}</label>
            <textarea
              value={(node.data.prompt as string) ?? ''}
              onChange={(e) => onUpdate('prompt', e.target.value)}
              rows={4}
              placeholder={t('aiPromptPlaceholder')}
              className={`${inputCls} resize-none`}
            />
          </div>
        )}

        {node.type === 'condition' && (
          <div>
            <label className="text-xs font-medium text-muted">{t('conditionPlaceholder')}</label>
            <input
              value={(node.data.condition as string) ?? ''}
              onChange={(e) => onUpdate('condition', e.target.value)}
              placeholder={t('conditionPlaceholder')}
              className={inputCls}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                {t('conditionTrue')}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium">
                {t('conditionFalse')}
              </span>
            </div>
          </div>
        )}

        {node.type === 'delay' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted">{t('delaySeconds')}</label>
              <input
                type="number"
                value={(node.data.delayValue as number) ?? 5}
                onChange={(e) => onUpdate('delayValue', e.target.value)}
                min={1}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">{t('delayUnit' as any)}</label>
              <select
                value={(node.data.delayUnit as string) ?? 'minutes'}
                onChange={(e) => onUpdate('delayUnit', e.target.value)}
                className={inputCls}
              >
                <option value="seconds">{t('delaySeconds')}</option>
                <option value="minutes">{t('delayMinutes')}</option>
                <option value="hours">{t('delayHours')}</option>
              </select>
            </div>
            <p className="text-[10px] text-dim">
              {t('delayHelpText' as any) || ''}
            </p>
          </div>
        )}

        {node.type === 'createBooking' && (
          <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/20">
            <p className="text-xs text-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              {t('autoCreateBookingDesc')}
            </p>
          </div>
        )}

        {node.type === 'setVariable' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted">{t('variableNamePlaceholder')}</label>
              <input
                value={(node.data.varName as string) ?? ''}
                onChange={(e) => onUpdate('varName', e.target.value)}
                placeholder={t('variableNamePlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">{t('variableValuePlaceholder')}</label>
              <input
                value={(node.data.varValue as string) ?? ''}
                onChange={(e) => onUpdate('varValue', e.target.value)}
                placeholder={t('variableValuePlaceholder')}
                className={inputCls}
              />
            </div>
          </div>
        )}

        {node.type === 'tagUser' && (
          <div>
            <label className="text-xs font-medium text-muted">{t('tagPlaceholder')}</label>
            <input
              value={(node.data.tag as string) ?? ''}
              onChange={(e) => onUpdate('tag', e.target.value)}
              placeholder={t('tagPlaceholder')}
              className={inputCls}
            />
          </div>
        )}

        {node.type === 'endFlow' && (
          <div className="p-3 rounded-xl bg-gray-500/5 border border-gray-500/20">
            <p className="text-xs text-muted flex items-center gap-1.5">
              <CircleStop className="w-3.5 h-3.5 text-gray-500" />
              {t('flowEndsHere')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────
export default function FlowBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const qc = useQueryClient();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: automation, isLoading } = useQuery({
    queryKey: ['automation', id],
    queryFn: () => automationsApi.get(id!),
    enabled: !!id,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[]);
  const [hasChanges, setHasChanges] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Load nodes/edges from automation
  useEffect(() => {
    if (automation) {
      const knownTypes = Object.keys(nodeTypes);
      const savedNodes = (automation.nodes ?? [])
        .filter((n: any) => knownTypes.includes(n.type))
        .map((n: any, idx: number) => ({
          ...n,
          position: n.position ?? { x: 250, y: 50 + idx * 150 },
          data: { ...n.data, label: n.data?.label || n.type },
        })) as Node[];
      setNodes(savedNodes);
      setEdges((automation.edges ?? []) as Edge[]);
    }
  }, [automation]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds: Edge[]) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
            style: { stroke: '#9ca3af' },
          },
          eds,
        ) as Edge[],
      );
      setHasChanges(true);
    },
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const saveMut = useMutation({
    mutationFn: () => {
      const cleanNodes = nodes.map((n: Node) => {
        const { onChange, onDelete, onToggleCollapse, collapsed, ...data } = n.data as any;
        return { ...n, data };
      });
      return automationsApi.update(id!, { nodes: cleanNodes, edges });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation', id] });
      setHasChanges(false);
      toast.success(t('flowSaved'));
    },
    onError: () => toast.error(t('updateFailed')),
  });

  const toggleMut = useMutation({
    mutationFn: () => automationsApi.toggle(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation', id] });
      qc.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.list,
  });

  const connectedChannels = (channels ?? []).filter((ch: any) => ch.status === 'CONNECTED');

  const channelMut = useMutation({
    mutationFn: (channelId: string) => automationsApi.update(id!, { channelId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation', id] });
      qc.invalidateQueries({ queryKey: ['automations'] });
      toast.success(t('channelUpdated'));
    },
    onError: () => toast.error(t('updateFailed')),
  });

  // ─── Right panel handlers ──────────────────────
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const updateNodeField = useCallback(
    (field: string, value: any) => {
      if (!selectedNodeId) return;
      setNodes((nds) =>
        nds.map((nd) =>
          nd.id === selectedNodeId ? { ...nd, data: { ...nd.data, [field]: value } } : nd,
        ),
      );
      setHasChanges(true);
    },
    [selectedNodeId, setNodes],
  );

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((nd) => nd.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
    );
    setSelectedNodeId(null);
    setHasChanges(true);
  }, [selectedNodeId, setNodes, setEdges]);

  // ─── Add node from sidebar ─────────────────────
  const getDemoData = useCallback(
    (type: string) => {
      switch (type) {
        case 'sendMessage': return { message: t('demoMessage') };
        case 'aiStep': return { prompt: t('demoAiPrompt') };
        case 'condition': return { condition: t('demoCondition') };
        case 'setVariable': return { varName: t('demoVarName'), varValue: '' };
        case 'tagUser': return { tag: t('demoTag') };
        default: return {};
      }
    },
    [t],
  );

  const addNode = useCallback(
    (type: string, position?: { x: number; y: number }) => {
      const newId = `${type}_${Date.now()}`;
      const meta = getMeta(type);
      const demo = getDemoData(type);
      const newNode: Node = {
        id: newId,
        type,
        position: position ?? { x: 250 + Math.random() * 100, y: 150 + nodes.length * 150 },
        data: { label: t(meta.labelKey as any), ...demo },
      };
      setNodes((nds) => [...nds, newNode]);
      setHasChanges(true);
      setSelectedNodeId(newId);
    },
    [nodes.length, setNodes, t, getDemoData],
  );

  // ─── Drag & drop ──────────────────────────────
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(type, position);
    },
    [reactFlowInstance, addNode],
  );

  if (isLoading) return <Spinner />;
  if (!automation) return null;

  const actionNodes = nodes.filter((n) => n.type !== 'trigger');

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-6">
      {/* ─── Top Bar ─────────────────────────────── */}
      <div className="bg-[var(--color-card)] border-b border-b-border px-4 py-3 flex items-center gap-4 shrink-0 z-10">
        <button
          onClick={() => navigate('/dashboard/automations')}
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted" />
        </button>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{automation.name}</h1>
            {automation.description && (
              <p className="text-xs text-muted truncate hidden sm:block">{automation.description}</p>
            )}
          </div>

          {/* Channel selector */}
          <select
            value={automation.channelId ?? ''}
            onChange={(e) => channelMut.mutate(e.target.value)}
            disabled={channelMut.isPending}
            className={`text-sm border rounded-lg px-3 py-2 bg-[var(--color-card)] max-w-[200px] focus:outline-none hidden sm:block ${
              !automation.channelId
                ? 'border-red-400 text-red-500'
                : 'border-b-border text-foreground'
            }`}
          >
            <option value="">{t('selectChannel')}...</option>
            {connectedChannels.map((ch: any) => (
              <option key={ch.id} value={ch.id}>
                {ch.externalName ?? ch.externalId} ({ch.type})
              </option>
            ))}
          </select>

          {/* Channel indicator for mobile */}
          {!automation.channelId && (
            <span className="text-[10px] text-red-500 flex items-center gap-1 font-medium sm:hidden">
              <AlertTriangle className="w-3 h-3" />
              {t('noChannel')}
            </span>
          )}
        </div>

        {/* Active toggle */}
        <button
          onClick={() => toggleMut.mutate()}
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          {automation.isActive ? (
            <ToggleRight className="h-6 w-6 text-emerald-500" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-muted" />
          )}
          <span
            className={`hidden sm:inline ${
              automation.isActive ? 'text-emerald-500' : 'text-muted'
            }`}
          >
            {automation.isActive ? t('active') : t('inactive')}
          </span>
        </button>

        {/* Save button */}
        <Button
          size="sm"
          onClick={() => saveMut.mutate()}
          loading={saveMut.isPending}
          disabled={!hasChanges}
          icon={<Save className="w-4 h-4" />}
        >
          <span className="hidden sm:inline">{t('save')}</span>
        </Button>
      </div>

      {/* ─── Main Layout: Sidebar + Canvas + Right Panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-[var(--color-card)] border-r border-b-border overflow-y-auto shrink-0 hidden sm:block">
          {/* Trigger section */}
          <div className="p-4 border-b border-b-border/50">
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider mb-3">
              {t('node_trigger' as any)}
            </h3>
            <button
              onClick={() => {
                const triggerNode = nodes.find((n) => n.type === 'trigger');
                if (triggerNode) setSelectedNodeId(triggerNode.id);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-500/30 text-sm font-medium text-blue-500 hover:bg-blue-500/10 transition-colors"
              style={{ backgroundColor: '#3b82f610' }}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {t('node_trigger' as any)}
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Action categories */}
          <div className="p-4 space-y-5">
            {SIDEBAR_CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <h3 className="text-xs font-bold text-dim uppercase tracking-wider mb-3">
                  {t(cat.labelKey as any)}
                </h3>
                <div className="space-y-2">
                  {NODE_DEFS.filter((n) => n.cat === cat.key).map((n) => {
                    const NIcon = n.Icon;
                    return (
                      <div
                        key={n.type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/reactflow', n.type);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onClick={() => addNode(n.type)}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-b-border/50 hover:border-b-border hover:bg-surface cursor-grab active:cursor-grabbing transition-all text-sm"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: n.color + '15' }}
                        >
                          <NIcon className="h-4 w-4" style={{ color: n.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-xs">{t(n.labelKey as any)}</p>
                          <p className="text-[10px] text-dim truncate">{t(n.descKey as any)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Canvas ─────────────────────────────── */}
        <div className="flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => {
              onNodesChange(changes);
              if (changes.some((c) => c.type !== 'select')) setHasChanges(true);
            }}
            onEdgesChange={(changes) => {
              onEdgesChange(changes);
              setHasChanges(true);
            }}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            onNodesDelete={() => setHasChanges(true)}
            proOptions={{ hideAttribution: true }}
            className="bg-surface"
          >
            <Background gap={20} size={1} color="var(--color-muted)" className="opacity-20" />
            <Controls className="!bg-[var(--color-card)] !border !border-b-border !rounded-xl !shadow-lg" />
            <MiniMap
              className="!bg-[var(--color-card)] !border !border-b-border !rounded-xl"
              nodeColor="#8b5cf6"
              maskColor="rgba(0,0,0,0.1)"
            />
          </ReactFlow>

          {/* Unsaved changes indicator */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--color-card)] border border-amber-500/30 shadow-lg text-xs text-amber-500 font-medium flex items-center gap-2 z-10"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t('unsavedChanges')}
            </motion.div>
          )}
        </div>

        {/* ─── Right Panel (Node Editor) ──────────── */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 bg-[var(--color-card)] border-l border-b-border overflow-y-auto shrink-0"
            >
              <NodeEditor
                key={selectedNodeId}
                node={selectedNode}
                onUpdate={updateNodeField}
                onDelete={deleteSelectedNode}
                onClose={() => setSelectedNodeId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Bar (Flow Summary) ────────────── */}
      <div className="bg-[var(--color-card)] border-t border-b-border px-4 py-3 shrink-0 z-10">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-dim shrink-0 uppercase tracking-wider">
            {t('sidebarFlow' as any)}:
          </span>

          {/* Trigger badge */}
          {nodes
            .filter((n) => n.type === 'trigger')
            .map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedNodeId(n.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedNodeId === n.id ? 'ring-1 ring-blue-400' : ''
                }`}
                style={{ backgroundColor: '#3b82f615', color: '#3b82f6' }}
              >
                <Zap className="h-3 w-3" />
                {t('node_trigger' as any)}
              </button>
            ))}

          {/* Action badges */}
          {actionNodes.map((n) => {
            const meta = getMeta(n.type);
            const NIcon = meta.Icon;
            return (
              <div key={n.id} className="flex items-center gap-1 shrink-0">
                <span className="text-dim">→</span>
                <button
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedNodeId === n.id ? 'ring-1' : ''
                  }`}
                  style={{
                    backgroundColor: meta.color + '15',
                    color: meta.color,
                    ...(selectedNodeId === n.id ? { boxShadow: `0 0 0 1px ${meta.color}` } : {}),
                  }}
                >
                  <NIcon className="h-3 w-3" />
                  {t(meta.labelKey as any)}
                </button>
              </div>
            );
          })}

          {actionNodes.length === 0 && (
            <span className="text-xs text-dim italic">
              {t('dragFromSidebar' as any)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
