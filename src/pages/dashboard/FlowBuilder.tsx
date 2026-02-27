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
  Panel,
  BackgroundVariant,
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
  GitBranch, Calendar, Tag, Send, Variable, ChevronLeft, ChevronRight,
  Zap, Hash, CircleStop,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { automationsApi } from '../../api/automations.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';

// ─── Node Types ─────────────────────────────────

const NODE_PALETTE = [
  { type: 'trigger', label: 'Trigger', icon: <Zap className="w-4 h-4" />, color: 'bg-blue-500', borderColor: 'border-blue-500/40' },
  { type: 'sendMessage', label: 'Send Message', icon: <Send className="w-4 h-4" />, color: 'bg-emerald-500', borderColor: 'border-emerald-500/40' },
  { type: 'aiStep', label: 'AI Step', icon: <Bot className="w-4 h-4" />, color: 'bg-violet-500', borderColor: 'border-violet-500/40' },
  { type: 'condition', label: 'Condition', icon: <GitBranch className="w-4 h-4" />, color: 'bg-orange-500', borderColor: 'border-orange-500/40' },
  { type: 'delay', label: 'Delay', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-500', borderColor: 'border-yellow-500/40' },
  { type: 'createBooking', label: 'Create Booking', icon: <Calendar className="w-4 h-4" />, color: 'bg-pink-500', borderColor: 'border-pink-500/40' },
  { type: 'setVariable', label: 'Set Variable', icon: <Variable className="w-4 h-4" />, color: 'bg-cyan-500', borderColor: 'border-cyan-500/40' },
  { type: 'tagUser', label: 'Tag User', icon: <Tag className="w-4 h-4" />, color: 'bg-red-500', borderColor: 'border-red-500/40' },
  { type: 'endFlow', label: 'End Flow', icon: <CircleStop className="w-4 h-4" />, color: 'bg-gray-500', borderColor: 'border-gray-500/40' },
];

function FlowNode({ data, type }: { data: any; type?: string }) {
  const meta = NODE_PALETTE.find((n) => n.type === type) ?? NODE_PALETTE[0];
  const isCondition = type === 'condition';

  return (
    <div className={`w-[240px] rounded-2xl border-2 ${meta.borderColor} bg-[var(--color-card)] shadow-lg transition-shadow hover:shadow-xl`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-muted !border-2 !border-[var(--color-card)]" />
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-b-border/50">
        <div className={`w-8 h-8 rounded-lg ${meta.color} flex items-center justify-center text-white shadow-sm`}>
          {meta.icon}
        </div>
        <span className="text-sm font-semibold text-foreground flex-1 truncate">{data.label || meta.label}</span>
      </div>
      <div className="px-4 py-3">
        {type === 'sendMessage' && (
          <textarea
            value={data.message ?? ''}
            onChange={(e) => data.onChange?.('message', e.target.value)}
            placeholder="Message text..."
            className="w-full text-xs bg-surface rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 resize-none border border-b-border focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            rows={2}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {type === 'aiStep' && (
          <input
            value={data.prompt ?? ''}
            onChange={(e) => data.onChange?.('prompt', e.target.value)}
            placeholder="AI prompt..."
            className="w-full text-xs bg-surface rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 border border-b-border focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {type === 'condition' && (
          <>
            <input
              value={data.condition ?? ''}
              onChange={(e) => data.onChange?.('condition', e.target.value)}
              placeholder="e.g. intent == booking"
              className="w-full text-xs bg-surface rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 border border-b-border focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center justify-between mt-2 text-[10px]">
              <span className="text-emerald-500 font-medium">True →</span>
              <span className="text-red-500 font-medium">← False</span>
            </div>
          </>
        )}
        {type === 'delay' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={data.delayValue ?? 5}
              onChange={(e) => data.onChange?.('delayValue', e.target.value)}
              className="w-20 text-xs bg-surface rounded-lg px-3 py-2 text-foreground border border-b-border focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              min={1}
              onClick={(e) => e.stopPropagation()}
            />
            <select
              value={data.delayUnit ?? 'minutes'}
              onChange={(e) => data.onChange?.('delayUnit', e.target.value)}
              className="flex-1 text-xs bg-surface rounded-lg px-2 py-2 text-foreground border border-b-border focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>
        )}
        {type === 'createBooking' && (
          <div className="text-xs text-muted flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Auto-create booking from conversation
          </div>
        )}
        {type === 'setVariable' && (
          <div className="space-y-2">
            <input
              value={data.varName ?? ''}
              onChange={(e) => data.onChange?.('varName', e.target.value)}
              placeholder="Variable name"
              className="w-full text-xs bg-surface rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 border border-b-border focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              onClick={(e) => e.stopPropagation()}
            />
            <input
              value={data.varValue ?? ''}
              onChange={(e) => data.onChange?.('varValue', e.target.value)}
              placeholder="Value"
              className="w-full text-xs bg-surface rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 border border-b-border focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        {type === 'tagUser' && (
          <input
            value={data.tag ?? ''}
            onChange={(e) => data.onChange?.('tag', e.target.value)}
            placeholder="Tag name..."
            className="w-full text-xs bg-surface rounded-lg px-3 py-2 text-foreground placeholder:text-muted/50 border border-b-border focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {type === 'trigger' && (
          <div className="text-xs text-muted flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-blue-500" />
            Flow starts here
          </div>
        )}
        {type === 'endFlow' && (
          <div className="text-xs text-muted flex items-center gap-1.5">
            <CircleStop className="w-3 h-3 text-gray-500" />
            Flow ends here
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-muted !border-2 !border-[var(--color-card)]" />
      {isCondition && (
        <>
          <Handle type="source" position={Position.Right} id="true" className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[var(--color-card)]" />
          <Handle type="source" position={Position.Left} id="false" className="!w-3 !h-3 !bg-red-500 !border-2 !border-[var(--color-card)]" />
        </>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  trigger: FlowNode,
  sendMessage: FlowNode,
  aiStep: FlowNode,
  condition: FlowNode,
  delay: FlowNode,
  createBooking: FlowNode,
  setVariable: FlowNode,
  tagUser: FlowNode,
  endFlow: FlowNode,
};

// ─── Main Component ─────────────────────────────

export default function FlowBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [paletteOpen, setPaletteOpen] = useState(true);

  const { data: automation, isLoading } = useQuery({
    queryKey: ['automation', id],
    queryFn: () => automationsApi.get(id!),
    enabled: !!id,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[]);
  const [hasChanges, setHasChanges] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load nodes/edges from automation
  useEffect(() => {
    if (automation) {
      const knownTypes = Object.keys(nodeTypes);
      const savedNodes = (automation.nodes ?? [])
        .filter((n: any) => knownTypes.includes(n.type))
        .map((n: any, idx: number) => ({
          ...n,
          // Ensure every node has a position (AI-created nodes may lack it)
          position: n.position ?? { x: 250, y: 50 + idx * 180 },
          data: {
            ...n.data,
            label: n.data?.label || NODE_PALETTE.find((p) => p.type === n.type)?.label || n.type,
            onChange: (field: string, value: string) => {
              setNodes((nds: Node[]) =>
                nds.map((nd: Node) =>
                  nd.id === n.id ? { ...nd, data: { ...nd.data, [field]: value } } : nd,
                ),
              );
              setHasChanges(true);
            },
          },
        })) as Node[];
      setNodes(savedNodes);
      setEdges((automation.edges ?? []) as Edge[]);
    }
  }, [automation]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds: Edge[]) => addEdge({ ...params, animated: true }, eds) as Edge[]);
      setHasChanges(true);
    },
    [setEdges],
  );

  const saveMut = useMutation({
    mutationFn: () => {
      const cleanNodes = nodes.map((n: Node) => {
        const { onChange, ...data } = n.data as any;
        return { ...n, data };
      });
      return automationsApi.update(id!, { nodes: cleanNodes, edges });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation', id] });
      setHasChanges(false);
      toast.success(t('flowSaved'));
    },
    onError: () => toast.error('Failed to save'),
  });

  const toggleMut = useMutation({
    mutationFn: () => automationsApi.toggle(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation', id] });
      qc.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const addNode = (type: string) => {
    const newId = `${type}_${Date.now()}`;
    const meta = NODE_PALETTE.find((n) => n.type === type)!;
    const newNode: Node = {
      id: newId,
      type,
      position: { x: 250 + Math.random() * 100, y: 150 + nodes.length * 150 },
      data: {
        label: meta.label,
        onChange: (field: string, value: string) => {
          setNodes((nds: Node[]) =>
            nds.map((nd: Node) =>
              nd.id === newId ? { ...nd, data: { ...nd.data, [field]: value } } : nd,
            ),
          );
          setHasChanges(true);
        },
      },
    };
    setNodes((nds: Node[]) => [...nds, newNode]);
    setHasChanges(true);
  };

  if (isLoading) return <Spinner />;
  if (!automation) return null;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 border-b border-b-border bg-base/80 backdrop-blur-sm flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard/automations')}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">{automation.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${automation.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface text-muted'}`}>
                {automation.isActive ? t('active') : t('inactive')}
              </span>
              <span className="text-[10px] text-dim flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {automation.runCount} {t('runs')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleMut.mutate()}
            icon={automation.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            className="hidden sm:flex"
          >
            {automation.isActive ? t('deactivate') : t('activate')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleMut.mutate()}
            icon={automation.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            className="sm:hidden"
          >{''}</Button>
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
      </div>

      {/* Flow Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => { onNodesChange(changes); setHasChanges(true); }}
          onEdgesChange={(changes) => { onEdgesChange(changes); setHasChanges(true); }}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          onNodesDelete={() => setHasChanges(true)}
          className="bg-base"
          proOptions={{ hideAttribution: true }}
        >
          <Controls
            className="!bg-[var(--color-card)] !border-[var(--color-border)] !rounded-xl !shadow-lg"
            position="bottom-right"
          />
          <MiniMap
            className="!bg-[var(--color-card)] !border-[var(--color-border)] !rounded-xl hidden sm:block"
            nodeColor={() => '#8b5cf6'}
            maskColor="rgba(0,0,0,0.1)"
            position="bottom-right"
            style={{ marginBottom: 50 }}
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-muted)" className="opacity-30" />

          {/* Node Palette */}
          <Panel position="top-left">
            <div className="flex items-start gap-1">
              <AnimatePresence mode="wait">
                {paletteOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card rounded-2xl border border-b-border shadow-xl p-2 sm:p-3"
                  >
                    <div className="text-[10px] text-muted font-semibold uppercase tracking-wider px-2 mb-2">{t('addNode')}</div>
                    <div className="space-y-0.5">
                      {NODE_PALETTE.filter((n) => n.type !== 'trigger').map((n) => (
                        <button
                          key={n.type}
                          onClick={() => addNode(n.type)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-all group"
                        >
                          <div className={`w-7 h-7 rounded-lg ${n.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                            {n.icon}
                          </div>
                          <span className="text-xs font-medium hidden sm:inline">{n.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setPaletteOpen(!paletteOpen)}
                className="p-1.5 rounded-lg glass-card border border-b-border shadow-md text-muted hover:text-foreground transition-all mt-1"
              >
                {paletteOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </Panel>

          {/* Unsaved changes indicator */}
          {hasChanges && (
            <Panel position="bottom-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 rounded-full glass-card border border-amber-500/30 shadow-lg text-xs text-amber-500 font-medium flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </motion.div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}
