import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  Wrench,
  Shirt,
  Package,
  Bell,
  Receipt,
  KeyRound,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  onOpenTelegramSimulator?: () => void;
  unreadAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenTelegramSimulator, unreadAlertsCount = 4 }) => {
  const [peopleOpen, setPeopleOpen] = useState(true);
  const { currentUser, switchRole } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-64 bg-[#0d131f] text-slate-300 flex flex-col h-screen select-none border-r border-slate-800/80 sticky top-0">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-base">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-white text-sm font-bold tracking-tight truncate leading-none">Apartments Managem..</h1>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mt-1 block">
            PROPERTY OPERATIONS
          </span>
        </div>
      </div>

      {/* Navigation Links (scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
        {/* OVERVIEW */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            OVERVIEW
          </div>
          <NavLink to="/" end className={navLinkClass}>
            <Home className="w-4 h-4" />
            <span>Home</span>
          </NavLink>
        </div>

        {/* PORTFOLIO */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            PORTFOLIO
          </div>
          <div className="space-y-1">
            <NavLink to="/apartments" className={navLinkClass}>
              <Building2 className="w-4 h-4" />
              <span>Apartments</span>
            </NavLink>

            {/* Collapsible People Menu */}
            <div>
              <button
                onClick={() => setPeopleOpen(!peopleOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>People</span>
                </div>
                {peopleOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {peopleOpen && (
                <div className="ml-7 pl-3 border-l border-slate-800/80 mt-1 space-y-1">
                  <NavLink
                    to="/people?tab=owners"
                    className={({ isActive }) =>
                      `block py-1.5 px-2 text-xs rounded-lg transition-colors ${
                        isActive ? 'text-blue-400 font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    Property Owners
                  </NavLink>
                  <NavLink
                    to="/people?tab=cleaners"
                    className={({ isActive }) =>
                      `block py-1.5 px-2 text-xs rounded-lg transition-colors ${
                        isActive ? 'text-blue-400 font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    Cleaners
                  </NavLink>
                  <NavLink
                    to="/people?tab=technicians"
                    className={({ isActive }) =>
                      `block py-1.5 px-2 text-xs rounded-lg transition-colors ${
                        isActive ? 'text-blue-400 font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    Technicians
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/zones" className={navLinkClass}>
              <MapPin className="w-4 h-4" />
              <span>Zones</span>
            </NavLink>
          </div>
        </div>

        {/* OPERATIONS */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            OPERATIONS
          </div>
          <div className="space-y-1">
            <NavLink to="/calendar" className={navLinkClass}>
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </NavLink>
            <NavLink to="/cleaning-tomorrow" className={navLinkClass}>
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Cleaning tomorrow</span>
            </NavLink>
            <NavLink to="/maintenance" className={navLinkClass}>
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Maintenance</span>
            </NavLink>
            <NavLink to="/linen" className={navLinkClass}>
              <Shirt className="w-4 h-4" />
              <span>Linen</span>
            </NavLink>
            <NavLink to="/warehouse" className={navLinkClass}>
              <Package className="w-4 h-4" />
              <span>Warehouse</span>
            </NavLink>
            <NavLink to="/alerts" className={navLinkClass}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-rose-400" />
                  <span>Alerts</span>
                </div>
                {unreadAlertsCount > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-rose-500/30">
                    {unreadAlertsCount}
                  </span>
                )}
              </div>
            </NavLink>
          </div>
        </div>

        {/* FINANCE */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            FINANCE
          </div>
          <NavLink to="/extra-services" className={navLinkClass}>
            <Receipt className="w-4 h-4" />
            <span>Extra services</span>
          </NavLink>
        </div>

        {/* ACCESS */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ACCESS
          </div>
          <div className="space-y-1">
            <NavLink to="/telegram-pin" className={navLinkClass}>
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Telegram PIN</span>
            </NavLink>
            <NavLink to="/system-users" className={navLinkClass}>
              <ShieldCheck className="w-4 h-4" />
              <span>System users</span>
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>

        {/* Telegram Live Simulator Shortcut */}
        {onOpenTelegramSimulator && (
          <div className="pt-2">
            <button
              onClick={onOpenTelegramSimulator}
              className="w-full bg-gradient-to-r from-sky-500/20 to-blue-600/20 border border-sky-500/40 text-sky-300 hover:text-white hover:bg-sky-500/30 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Telegram Bot Live</span>
              </div>
              <span className="bg-sky-500/30 text-sky-200 text-[10px] px-1.5 py-0.5 rounded font-mono">SIM</span>
            </button>
          </div>
        )}
      </div>

      {/* Role / User Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs">
              {currentUser.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-200 truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={() => switchRole('administrator')}
            title="Log out or switch"
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
