import React, { useState, useEffect } from 'react';
import { KeyRound, RefreshCw, Bot, ShieldCheck, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';
import { api } from '../utils/api.js';

interface TelegramPinPageProps {
  onOpenSimulator?: () => void;
}

export const TelegramPinPage: React.FC<TelegramPinPageProps> = ({ onOpenSimulator }) => {
  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  const fetchPins = async () => {
    try {
      setLoading(true);
      const data = await api.getTelegramPins();
      setPins(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const handleGeneratePin = async (userId: string) => {
    try {
      await api.generateTelegramPin(userId);
      fetchPins();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1">Access / Integration</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Telegram Bot PINs</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              Active Integration
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Generate and manage 6-digit pairing PINs for cleaners and maintenance technicians.
          </p>
        </div>

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#229ED9] hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs shadow-sky-500/20 self-start sm:self-auto"
          >
            <Bot className="w-4 h-4" />
            <span>Open Telegram Simulator</span>
          </button>
        )}
      </div>

      {/* Guide Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/80 rounded-3xl p-6 text-xs text-sky-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-bold text-sm text-sky-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#229ED9]" />
            <span>How Staff Connects via Telegram</span>
          </div>
          <p className="text-sky-800 leading-relaxed max-w-2xl">
            1. Cleaners open the Telegram bot (<strong>@PropFlowOpsBot</strong>) or use the built-in simulator.<br />
            2. Send command <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">/link &lt;PIN&gt;</code> (e.g. <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">/link 482910</code>).<br />
            3. Once linked, turnover schedules, checklists, and urgent defect alerts will arrive instantaneously.
          </p>
        </div>
      </div>

      {/* PINs List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-4">Staff Member</th>
              <th className="p-4">Role</th>
              <th className="p-4">6-Digit Pairing PIN</th>
              <th className="p-4">Pairing Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pins.map((p) => (
              <tr key={p.userId} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-900">{p.userName}</div>
                  <div className="text-[11px] text-slate-400">{p.email}</div>
                </td>
                <td className="p-4">
                  <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {p.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  {p.telegramPin ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold tracking-widest text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {p.telegramPin}
                      </span>
                      <button
                        onClick={() => copyToClipboard(p.telegramPin)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                        title="Copy PIN"
                      >
                        {copiedPin === p.telegramPin ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No PIN active</span>
                  )}
                </td>
                <td className="p-4">
                  {p.isPaired ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2.5 py-0.5 rounded-full text-[11px]">
                      <span>Pending Link</span>
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleGeneratePin(p.userId)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>Regenerate</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
