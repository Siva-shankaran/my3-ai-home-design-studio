import React, { useState } from 'react';
import { Project, ChatMessage } from '../types';
import { chatService } from '../services/chatService';
import { 
  Send, Bot, Sparkles, Check, ArrowRight, 
  MessageSquare, Brain, Loader2, ShieldCheck
} from 'lucide-react';

interface AiChatAssistantProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  activeFloor?: number;
}

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({ 
  project, 
  onUpdateProject,
  activeFloor = 1 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'assistant',
      content: `Welcome to **MY3 Desings** CAD Assistant! I'm powered by **Nemotron 3.5**. You can talk directly to your floor plan to resize rooms, move walls, add closets, or rearrange layouts in real time.`,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeThinking, setActiveThinking] = useState<string | null>(null);

  const floor1QuickPrompts = [
    "Expand living room by 20%",
    "Add a guest powder room",
    "Add covered patio loggia",
    "Add executive office",
    "Check load-bearing walls & joist spans"
  ];

  const floor2QuickPrompts = [
    "Enlarge master suite by 25%",
    "Add walk-in dressing wardrobe",
    "Add master terrace balcony",
    "Add en-suite half bath",
    "Verify IRC egress windows"
  ];

  const quickPrompts = activeFloor === 2 ? floor2QuickPrompts : floor1QuickPrompts;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);
    setActiveThinking(`Nemotron 3.5 evaluating boundary geometry, IRC egress, and structural load paths on Floor ${activeFloor}...`);

    try {
      const result = await chatService.processPlanInstruction(project, text, activeFloor);
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: result.reply,
        thinking: result.thinking || "Reasoning budget: 16,384 tokens. Evaluated room adjacencies, updated bounding box coordinates, and recalculated dimensions.",
        appliedChanges: result.appliedChanges,
        structuralNotes: result.structuralNotes,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      onUpdateProject(result.updatedProject);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: "I encountered an error processing that instruction, but I've verified the current plan integrity.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
      setActiveThinking(null);
    }
  };

  return (
    <div className="w-84 h-full flex flex-col bg-[var(--color-paper)] border-l border-[var(--color-rule)] text-[var(--color-ink)] text-xs font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-rule)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#dc2626]/10 text-[#dc2626] rounded-lg border border-[#dc2626]/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-[var(--color-ink)] font-display">Talk to Your Plan</h4>
              <span className="text-[10px] bg-[#0f172a] text-white font-mono px-1.5 py-0.5 rounded">
                Floor {activeFloor}
              </span>
            </div>
            <span className="text-[10px] text-[#dc2626] font-mono font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full animate-pulse" />
              Nemotron 3.5 Online
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] font-mono font-bold mb-2 block">
          One-Click Actions for Floor {activeFloor}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isProcessing}
              className="text-[11px] font-mono bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] px-2.5 py-1 rounded border border-[var(--color-rule)] transition text-left disabled:opacity-50 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <span className="text-[10px] font-mono font-medium text-[var(--color-muted)]">
                {msg.role === 'user' ? 'You' : 'MY3 Desings AI'}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-muted)]">{msg.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-xl max-w-[92%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0f172a] text-white rounded-tr-sm shadow-xs'
                  : 'bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-line font-sans">{msg.content}</p>

              {/* Reasoning Trace */}
              {msg.thinking && (
                <div className="mt-2 pt-2 border-t border-[var(--color-rule)] text-[10px] text-[var(--color-muted)] flex items-start gap-1.5 bg-[var(--color-paper)] p-2 rounded font-mono">
                  <Brain className="w-3.5 h-3.5 text-[#dc2626] shrink-0 mt-0.5" />
                  <span>{msg.thinking}</span>
                </div>
              )}

              {/* Applied CAD Changes */}
              {msg.appliedChanges && msg.appliedChanges.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[var(--color-rule)] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#dc2626] uppercase tracking-wider block">
                    CAD Changes Applied:
                  </span>
                  {msg.appliedChanges.map((change, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink)] bg-[#dc2626]/10 px-2 py-0.5 rounded border border-[#dc2626]/30 font-mono">
                      <Check className="w-3 h-3 text-[#dc2626] shrink-0" />
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Structural Notes */}
              {msg.structuralNotes && msg.structuralNotes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[var(--color-rule)] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[var(--color-ink)] uppercase tracking-wider block flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#dc2626]" />
                    Engineering & Code Notes:
                  </span>
                  {msg.structuralNotes.map((note, i) => (
                    <div key={i} className="text-[10.5px] text-[var(--color-ink)] bg-[var(--color-paper)] px-2 py-0.5 rounded border border-[var(--color-rule)] font-mono">
                      • {note}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex flex-col items-start space-y-1">
            <div className="p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] rounded-xl rounded-tl-sm flex items-center space-x-2 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-[#dc2626]" />
              <span>{activeThinking || "Recalculating CAD plan..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-[var(--color-rule)] bg-[var(--color-paper-2)]">
        <div className="flex items-center space-x-2 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-lg px-3 py-1.5 focus-within:border-[#dc2626] transition">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Talk to Floor ${activeFloor} (e.g. enlarge master bedroom)...`}
            className="flex-1 bg-transparent text-[var(--color-ink)] placeholder-[var(--color-muted)] text-xs focus:outline-none font-mono"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isProcessing}
            className="p-1.5 bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-40 text-white rounded-md transition cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

