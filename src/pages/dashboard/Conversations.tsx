import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Instagram, Music2, User, Bot,
  Search, ChevronLeft, ToggleLeft, ToggleRight, Clock,
  Calendar, ArrowRight
} from 'lucide-react';
import { conversationsApi } from '../../api/conversations.api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATE_BADGES: Record<string, { label: string; color: string }> = {
  initial: { label: 'New', color: 'bg-blue-500/20 text-blue-400' },
  greeting: { label: 'Greeted', color: 'bg-emerald-500/20 text-emerald-400' },
  qa_flow: { label: 'Q&A', color: 'bg-violet-500/20 text-violet-400' },
  booking_collect: { label: 'Booking', color: 'bg-orange-500/20 text-orange-400' },
  booking_confirm: { label: 'Confirming', color: 'bg-yellow-500/20 text-yellow-400' },
  booking_done: { label: 'Booked', color: 'bg-emerald-500/20 text-emerald-400' },
  fallback: { label: 'Fallback', color: 'bg-red-500/20 text-red-400' },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function Conversations() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const msgEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // List conversations
  const { data: convList, isLoading: loadingList } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsApi.list({ limit: 50 }),
    refetchInterval: 15000,
  });

  // Selected conversation detail
  const { data: convDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['conversation', selectedId],
    queryFn: () => conversationsApi.getById(selectedId!),
    enabled: !!selectedId,
    refetchInterval: 10000,
  });

  // Send reply
  const replyMutation = useMutation({
    mutationFn: (text: string) => conversationsApi.sendReply(selectedId!, text),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Reply queued');
    },
    onError: () => toast.error('Failed to send reply'),
  });

  // Toggle AI
  const toggleMutation = useMutation({
    mutationFn: (isActive: boolean) => conversationsApi.toggleAi(selectedId!, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convDetail?.messages]);

  const conversations = (convList?.data ?? []).filter(
    (c: any) => !search || c.customerName?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSend = () => {
    const text = replyText.trim();
    if (!text || !selectedId) return;
    replyMutation.mutate(text);
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex rounded-2xl overflow-hidden border border-white/5 bg-card">
      {/* ─── LEFT: Conversation List ─── */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        {/* Search */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-blue-500/30 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20">
              <MessageSquare className="w-10 h-10 mb-3" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Messages will appear here when customers DM you</p>
            </div>
          ) : (
            conversations.map((conv: any) => (
              <motion.button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full p-3.5 flex gap-3 text-left border-b border-white/3 transition-all hover:bg-white/3 ${
                  selectedId === conv.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/50" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    {conv.channelType === 'INSTAGRAM' ? (
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    ) : (
                      <Music2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-white truncate">
                      {conv.customerName}
                    </span>
                    <span className="text-[10px] text-white/30 flex-shrink-0">
                      {conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/40 truncate flex-1">
                      {conv.lastMessage?.content ?? 'No messages'}
                    </p>
                    {STATE_BADGES[conv.state] && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATE_BADGES[conv.state].color}`}>
                        {STATE_BADGES[conv.state].label}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="px-3 py-2 border-t border-white/5 text-[10px] text-white/20 text-center">
          {convList?.total ?? 0} conversations
        </div>
      </div>

      {/* ─── RIGHT: Chat View ─── */}
      <div className={`flex-1 flex flex-col ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/15">
            <MessageSquare className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm mt-1">Choose from the list to view messages</p>
          </div>
        ) : loadingDetail ? (
          <div className="flex-1 flex items-center justify-center"><Spinner /></div>
        ) : convDetail ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="md:hidden p-1.5 text-white/40 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white/50" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {convDetail.customerName ?? convDetail.customerExternalId}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/30">
                  {convDetail.channel.type === 'INSTAGRAM' ? (
                    <><Instagram className="w-3 h-3 text-pink-400" /> Instagram</>
                  ) : (
                    <><Music2 className="w-3 h-3 text-cyan-400" /> TikTok</>
                  )}
                  <span>·</span>
                  <span>{STATE_BADGES[convDetail.state]?.label ?? convDetail.state}</span>
                </div>
              </div>

              {/* AI Toggle */}
              <button
                onClick={() => toggleMutation.mutate(!convDetail.isActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  convDetail.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
                title={convDetail.isActive ? 'AI Auto-Reply ON' : 'AI Auto-Reply OFF'}
              >
                {convDetail.isActive ? (
                  <><ToggleRight className="w-4 h-4" /> AI On</>
                ) : (
                  <><ToggleLeft className="w-4 h-4" /> AI Off</>
                )}
              </button>
            </div>

            {/* Appointments (if any) */}
            {convDetail.appointments?.length > 0 && (
              <div className="px-4 py-2 border-b border-white/5 flex gap-2 overflow-x-auto">
                {convDetail.appointments.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex-shrink-0"
                  >
                    <Calendar className="w-3 h-3" />
                    {apt.service?.name} — {new Date(apt.startsAt).toLocaleDateString()}
                    <span className="text-[10px] text-emerald-400/60">{apt.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {convDetail.messages?.map((msg: any) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.direction === 'INBOUND' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.direction === 'INBOUND'
                          ? 'bg-white/5 border border-white/5 text-white/80'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${
                        msg.direction === 'INBOUND' ? 'text-white/20' : 'text-white/60'
                      }`}>
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.isAiGenerated && (
                          <span className="flex items-center gap-0.5 ml-1 text-violet-300">
                            <Bot className="w-2.5 h-2.5" /> AI
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={msgEndRef} />
            </div>

            {/* Reply Input */}
            <div className="px-4 py-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-blue-500/30 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
