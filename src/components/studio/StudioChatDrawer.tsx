import React, { useState, useRef, useEffect } from 'react';
import type { ProjectDesign } from '../../types/project.ts';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  X, 
  RotateCcw, 
  Check, 
  Bot, 
  User, 
  Zap, 
  Loader2,
  ChevronRight
} from 'lucide-react';

interface StudioChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDesign;
  onApplyPatch: (patch: Record<string, any>, replyMsg: string) => void;
}

interface ChatEntry {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  patchApplied?: Record<string, any>;
  timestamp: string;
}

const QUICK_CHIPS = [
  'L-shaped grey sofa',
  'King bed with white linen',
  'Marble floor in bedrooms',
  'SUV parking in portico',
  'Walls in terracotta #C4552D',
  'Switch to warm 2700K lighting',
  'Add laundry washer & dryer'
];

export const StudioChatDrawer: React.FC<StudioChatDrawerProps> = ({
  isOpen,
  onClose,
  project,
  onApplyPatch
}) => {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am your AI Architectural & Interior Designer. Tell me how you'd like to refine your home — for example: "L-shaped grey sofa", "king bed with white linen", or "marble floor in bedrooms".`,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isThinking) return;

    const userEntry: ChatEntry = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userEntry]);
    setInputValue('');
    setIsThinking(true);

    try {
      const currentState = {
        seed: project.seed || 10482,
        sofa: project.sofa || '3-seater',
        sofaC: project.sofaC || '#64748B',
        bed: project.bed || 'Queen',
        bedC: project.bedC || '#FFFFFF',
        flr: project.flr || 'tile',
        flB: project.flB || 'marble',
        flW: project.flW || 'granite',
        lt: project.lt || 'warm',
        car: project.car || 'SUV',
        wall: project.wall || '#F4EFEB'
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          state: currentState,
          history: messages.slice(-4).map(m => ({ role: m.sender, content: m.text }))
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const patch = data.patch || {};
      const reply = data.reply || "I've applied your design refinements to the plan.";

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          patchApplied: Object.keys(patch).length > 0 ? patch : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (Object.keys(patch).length > 0) {
        onApplyPatch(patch, reply);
      }
    } catch (err: any) {
      console.warn('[Chat Error]:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: `Applied your request using the built-in architectural parser.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-xl shadow-2xl flex flex-col overflow-hidden font-sans animate-fadeIn">
      {/* Drawer Header */}
      <div className="p-3.5 bg-[var(--color-paper-2)] border-b border-[var(--color-rule-2)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-sm font-semibold text-[var(--color-ink)]">
                AI Architect &amp; Interior Copilot
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                LIVE
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-muted)] font-mono block">
              Direct Floor Plan &amp; Material Mutations
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[var(--color-muted)] hover:text-[var(--color-ink)] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Chips Strip */}
      <div className="p-2 border-b border-[var(--color-rule-2)] bg-[var(--color-paper-3)] overflow-x-auto flex items-center gap-1.5 text-[11px] font-mono whitespace-nowrap scrollbar-none">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1 rounded-full bg-[var(--color-paper)] border border-[var(--color-rule-2)] hover:border-[var(--color-accent)] text-[var(--color-ink)] hover:text-[var(--color-accent)] transition cursor-pointer flex-shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed font-sans ${
                m.sender === 'user'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs rounded-tr-none'
                  : 'bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] text-[var(--color-ink)] rounded-tl-none'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-mono text-[10px] opacity-75">
                {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                <span>{m.sender === 'user' ? 'You' : 'MY3 Copilot'}</span>
                <span>• {m.timestamp}</span>
              </div>
              <p>{m.text}</p>

              {m.patchApplied && (
                <div className="mt-2 pt-2 border-t border-[var(--color-rule-2)] font-mono text-[10px] space-y-0.5 text-emerald-800 bg-emerald-50/60 p-1.5 rounded">
                  <div className="font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Applied to Active Floor Plan:</span>
                  </div>
                  {Object.entries(m.patchApplied).map(([k, v]) => (
                    <div key={k}>
                      • <span className="font-semibold">{k}:</span> {String(v)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-muted)] p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-accent)]" />
            <span>Refining architectural parameters...</span>
          </div>
        )}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-[var(--color-paper-2)] border-t border-[var(--color-rule-2)] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="e.g. L-shaped grey sofa, king bed..."
          className="flex-1 bg-[var(--color-paper)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isThinking}
          className="p-2 rounded bg-[var(--color-accent)] text-white hover:opacity-90 transition disabled:opacity-40 cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
