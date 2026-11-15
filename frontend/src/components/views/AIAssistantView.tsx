import React, { useState } from 'react';
import { api } from '../../api';
import { Bot, Send } from 'lucide-react';

interface AIAssistantViewProps {
  userName?: string;
  astronautId?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  disclaimer?: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ userName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `AstroCare Decision Support online. Grounded in your telemetry records (NASA Ares-V Gateway). How can I assist you with your trend metrics or alerts today?`,
      sources: ['NASA Human Research Program (HRP)', 'Biometric Analyzer'],
      disclaimer: 'Non-diagnostic operational support. Consult Flight Surgeon for medical diagnoses.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    "Why has my sleep duration changed?",
    "Explain my recent heart rate trend.",
    "What does this health alert mean?",
    "Give me my daily health summary.",
    "What health measurements are missing?"
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.chat(textToSend, history);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          sources: res.sources_consulted,
          disclaimer: res.disclaimer
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Link offline: ${err.message}. Reverting to local rule-based decision support logic.`,
          sources: ['Ground Station Fallback Handler']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-3 border-b border-[#1c2738]">
        <h1 className="text-base font-semibold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Bot className="w-4 h-4 text-sky-400" />
          AstroCare AI Decision Support Assistant
        </h1>
        <p className="text-xs text-slate-400">
          Contextual flight-surgeon decision support grounded in personal mission telemetry.
        </p>
      </div>

      {/* Terminal-Style Clean Chat Interface */}
      <div className="aero-panel flex flex-col h-[600px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 bg-[#111a2a] border border-[#233247] flex items-center justify-center text-[10px] font-mono text-sky-400 shrink-0">
                  AI
                </div>
              )}

              <div
                className={`max-w-2xl p-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sky-900/60 border border-sky-700/60 text-sky-100'
                    : 'bg-[#070c14] border border-[#1c2738] text-slate-200 space-y-2'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-[#1c2738] text-[10px] text-slate-500 font-mono flex flex-wrap items-center gap-1.5">
                    <span className="text-sky-400">SOURCES:</span>
                    {msg.sources.join(' • ')}
                  </div>
                )}

                {msg.disclaimer && (
                  <div className="text-[10px] text-amber-400/90 bg-amber-950/20 p-1.5 border border-amber-900/40 font-mono">
                    PROTOCOL: {msg.disclaimer}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-300 shrink-0">
                  ME
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              Consulting biometric model and flight rules...
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="px-3 py-2 border-t border-[#1c2738] bg-[#070c14] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">Prompts:</span>
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-2 py-0.5 bg-[#0b121e] hover:bg-slate-800 border border-[#1c2738] text-slate-300 shrink-0 font-mono text-[10px] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Prompt Input */}
        <div className="p-3 bg-[#0b121e] border-t border-[#1c2738]">
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Query biometric trends, sleep deficits, or early warning protocols..."
              className="flex-1 px-3 py-2 bg-[#070c14] border border-[#1c2738] text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Transmit</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
