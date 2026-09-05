import React, { useState } from 'react';
import { Settings, Shield, RefreshCw, Bot, Bell, Database, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [botToken, setBotToken] = useState('7129038472:AAH9f2Xo_PropFlowDemoTokenMock');
  const [saved, setSaved] = useState(false);
  const [syncInterval, setSyncInterval] = useState('5');
  const [autoDeductLinen, setAutoDeductLinen] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-1">Access / Configuration</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Configure operations automation, Telegram bot keys, and channel sync policies.
        </p>
      </div>

      <div className="space-y-6">
        {/* Telegram Bot Config */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#229ED9] flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Telegram Bot Integration</h3>
              <p className="text-xs text-slate-400">Configure your official Telegram BotFather API token</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Telegram Bot Token</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                The embedded simulator works out-of-the-box. Providing a live token forwards messages to actual Telegram chats.
              </span>
            </div>
          </div>
        </div>

        {/* Operational Automation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Operational Automation</h3>
              <p className="text-xs text-slate-400">Rules for turnover scheduling and warehouse deductions</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Auto-deduct Linen upon Turnover Completion</div>
                <div className="text-[11px] text-slate-400">Automatically transfer clean towels and bedsheets to dirty laundry tally</div>
              </div>
              <input
                type="checkbox"
                checked={autoDeductLinen}
                onChange={(e) => setAutoDeductLinen(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">OTA iCal Synchronization Frequency</div>
                <div className="text-[11px] text-slate-400">Interval for pulling Airbnb, Booking.com, and Guesty calendars</div>
              </div>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-xs"
              >
                <option value="5">Every 5 minutes (Recommended)</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Hourly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Settings saved!</span>
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
