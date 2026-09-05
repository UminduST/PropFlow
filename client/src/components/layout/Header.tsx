import React, { useState } from 'react';
import { Search, Settings, RefreshCw, ChevronDown, Check, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface HeaderProps {
  lastSyncTime?: string;
  onSync?: () => Promise<void>;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lastSyncTime,
  onSync,
  onOpenSearch,
  onOpenSettings
}) => {
  const { currentUser, switchRole, allUsers } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleSyncClick = async () => {
    if (onSync) {
      setSyncing(true);
      try {
        await onSync();
      } finally {
        setTimeout(() => setSyncing(false), 600);
      }
    }
  };

  // Human readable time since last sync
  const getSyncText = () => {
    if (!lastSyncTime) return 'Last sync 5 minutes ago';
    const diffMs = Date.now() - new Date(lastSyncTime).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins <= 1) return 'Last sync just now';
    if (diffMins < 60) return `Last sync ${diffMins} minutes ago`;
    return 'Last sync today';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left Title & Date */}
      <div>
        <div className="text-[11px] font-bold tracking-wider text-slate-800 uppercase">
          OPERATIONS WORKSPACE
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Friday, 28 Aug 2026
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Input Bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 transition-colors w-48 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400 shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          title="System Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Sync Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{getSyncText()}</span>
        </div>

        {/* Sync Now Button */}
        <button
          onClick={handleSyncClick}
          disabled={syncing}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-75"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync now'}</span>
        </button>

        {/* Role Preview Dropdown & User Profile */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.avatar}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Role Switching Dropdown Menu */}
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Role Simulator Switcher
                </div>
                <div className="text-xs text-slate-600">
                  Switch view to inspect permissions & UI
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                {[
                  { role: 'administrator' as UserRole, label: 'Administrator', desc: 'Full system management' },
                  { role: 'operations_manager' as UserRole, label: 'Operations Manager', desc: 'Turnovers, cleaners & warehouse' },
                  { role: 'cleaner' as UserRole, label: 'Cleaner (Elena Volkova)', desc: 'Mobile-friendly turnovers & checklists' },
                  { role: 'maintenance' as UserRole, label: 'Technician (David Reynolds)', desc: 'Work orders & repair proofs' },
                  { role: 'owner' as UserRole, label: 'Owner (Alexander Wright)', desc: 'Investor portal & earnings' }
                ].map(item => {
                  const isCurrent = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchRole(item.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 opacity-70" />
                          <span>{item.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
