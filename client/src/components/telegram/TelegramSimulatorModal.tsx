import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Image, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TelegramMessage } from '../../types/index.js';
import { api } from '../../utils/api.js';

interface TelegramSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityTriggered?: () => void;
}

export const TelegramSimulatorModal: React.FC<TelegramSimulatorModalProps> = ({
  isOpen,
  onClose,
  onActivityTriggered
}) => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await api.getTelegramMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !photoUrlInput.trim()) return;

    setLoading(true);
    setInput('');
    try {
      const res = await api.simulateTelegramMessage(textToSend, photoUrlInput || undefined);
      setMessages(res.allMessages);
      setPhotoUrlInput('');
      setShowPhotoInput(false);
      if (onActivityTriggered) onActivityTriggered();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[640px] max-h-[90vh]">
        {/* Telegram Header */}
        <div className="bg-[#229ED9] text-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                <span>PropFlow Operations Bot</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-[11px] text-sky-100 font-medium">@PropFlowOpsBot • bot</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-sky-50/70 border-b border-sky-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider shrink-0 mr-1">Quick:</span>
          <button
            onClick={() => handleSendMessage('/tasks')}
            className="px-2 py-1 bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-lg shrink-0 font-medium transition-colors"
          >
            /tasks
          </button>
          <button
            onClick={() => handleSendMessage('/link 482910')}
            className="px-2 py-1 bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-lg shrink-0 font-medium transition-colors"
          >
            /link 482910 (Elena)
          </button>
          <button
            onClick={() => handleSendMessage('/report_lost')}
            className="px-2 py-1 bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-lg shrink-0 font-medium transition-colors"
          >
            /report_lost
          </button>
          <button
            onClick={() => handleSendMessage('/accept_cln-1')}
            className="px-2 py-1 bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-lg shrink-0 font-medium transition-colors"
          >
            /accept_cln-1
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#eef2f6]">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div key={m.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs space-y-1.5 ${
                    isBot
                      ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-100'
                      : 'bg-[#229ED9] text-white rounded-tr-xs shadow-sm'
                  }`}
                >
                  {m.mediaUrl && (
                    <img
                      src={m.mediaUrl}
                      alt="Uploaded media"
                      className="rounded-xl max-h-48 w-full object-cover border border-slate-100"
                    />
                  )}
                  <div className="whitespace-pre-line leading-relaxed font-sans">
                    {m.text}
                  </div>

                  {/* Interactive inline buttons for tasks */}
                  {m.buttons && m.buttons.length > 0 && (
                    <div className="pt-2 grid grid-cols-1 gap-1.5 border-t border-slate-100">
                      {m.buttons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (btn.callback_data.startsWith('accept_')) {
                              handleSendMessage(`/${btn.callback_data}`);
                            } else if (btn.callback_data.startsWith('complete_')) {
                              handleSendMessage(`/${btn.callback_data}`);
                            } else {
                              handleSendMessage(`Action: ${btn.text}`);
                            }
                          }}
                          className="w-full py-1.5 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-sky-700 font-semibold text-[11px] text-center transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3 h-3 text-sky-600" />
                          <span>{btn.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[9px] text-right font-mono ${
                      isBot ? 'text-slate-400' : 'text-sky-100'
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Media URL drawer if toggled */}
        {showPhotoInput && (
          <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <input
              type="text"
              placeholder="Paste photo URL (e.g. https://images.unsplash.com/...)"
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
            <button
              onClick={() => setShowPhotoInput(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setShowPhotoInput(!showPhotoInput)}
            title="Attach Photo URL"
            className="p-2 text-slate-400 hover:text-[#229ED9] hover:bg-sky-50 rounded-xl transition-colors"
          >
            <Image className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Type a Telegram command (/tasks, /start)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={loading}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-800"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || (!input.trim() && !photoUrlInput.trim())}
            className="p-2 bg-[#229ED9] hover:bg-sky-600 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
