import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, User as UserIcon, RefreshCw, Flame } from 'lucide-react';
import { api } from '../services/api.js';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'I keep missing my workout.',
  'Generate an optimal daily routine',
  'How do I maintain discipline without burnout?',
  'Give me a plan for this week'
];

export const AICoachModal: React.FC<AICoachModalProps> = ({ isOpen, onClose, currentStreak }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to ARC AI. I am your personal companion through this season of transformation.\n\nRemember our baseline: **Consistency over perfection.** How can I support your discipline today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAICoach(messageText);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I'm right here with you. Even when things feel scattered, remember that a 1% action today counts. Let's keep moving forward.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-winter-900 border border-white/10 rounded-t-3xl sm:rounded-3xl flex flex-col h-[88vh] sm:h-[80vh] shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-winter-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-winter-cyan/20 to-indigo-500/20 border border-winter-cyan/30 flex items-center justify-center shadow-glow-cyan">
              <Bot className="w-5 h-5 text-winter-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white font-display text-sm tracking-wide">ARC AI</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-winter-cyan/15 text-winter-cyan border border-winter-cyan/30">
                  Benevolent Coach
                </span>
                {currentStreak > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {currentStreak}d Streak
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Zero Guilt • Relentless Consistency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-winter-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-winter-cyan" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-winter-cyan text-winter-950 font-medium rounded-tr-sm shadow-glow-cyan'
                    : 'bg-winter-850 border border-white/5 text-slate-200 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[9px] text-right ${
                    msg.role === 'user' ? 'text-winter-950/70' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-winter-cyan/20 border border-winter-cyan/40 flex items-center justify-center shrink-0 mt-0.5">
                  <UserIcon className="w-3.5 h-3.5 text-winter-cyan" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-9">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-winter-cyan" />
              <span>ARC AI is crafting your perspective...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        <div className="px-4 py-2 border-t border-white/5 bg-winter-950/50">
          <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-winter-800/80 border border-white/10 text-slate-300 hover:border-winter-cyan/50 hover:text-white transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/5 bg-winter-850 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask ARC AI about your routine, missed days..."
            className="flex-1 p-3 rounded-xl glass-input text-xs text-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-winter-cyan text-winter-950 flex items-center justify-center shadow-glow-cyan disabled:opacity-40 transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
