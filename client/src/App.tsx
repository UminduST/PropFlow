import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { TelegramSimulatorModal } from './components/telegram/TelegramSimulatorModal.js';

import { HomePage } from './pages/HomePage.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { ApartmentsPage } from './pages/ApartmentsPage.js';
import { PeoplePage } from './pages/PeoplePage.js';
import { ZonesPage } from './pages/ZonesPage.js';
import { CleaningTomorrowPage } from './pages/CleaningTomorrowPage.js';
import { MaintenancePage } from './pages/MaintenancePage.js';
import { LinenPage } from './pages/LinenPage.js';
import { WarehousePage } from './pages/WarehousePage.js';
import { AlertsPage } from './pages/AlertsPage.js';
import { ExtraServicesPage } from './pages/ExtraServicesPage.js';
import { TelegramPinPage } from './pages/TelegramPinPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

import { AuthProvider } from './context/AuthContext.js';
import { DashboardData } from './types/index.js';
import { api } from './utils/api.js';
import { Search, X, Bot } from 'lucide-react';

function AppContent() {
  const navigate = useNavigate();
  const [telegramSimulatorOpen, setTelegramSimulatorOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());

  const loadData = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
      if (data.lastSyncTime) setLastSyncTime(data.lastSyncTime);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Ctrl+K keyboard shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGlobalSync = async () => {
    await api.syncNow();
    await loadData();
  };

  const quickSearchItems = [
    { title: 'Home Dashboard', subtitle: 'Live overview and key operational metrics', path: '/' },
    { title: 'Booking Calendar', subtitle: 'Timeline & multi-channel reservation schedule', path: '/calendar' },
    { title: 'Cleaning Tomorrow', subtitle: 'Upcoming turnovers and cleaner checklist', path: '/cleaning-tomorrow' },
    { title: 'Maintenance Tasks', subtitle: 'Work orders, budget and repair tracking', path: '/maintenance' },
    { title: 'Linen Inventory', subtitle: 'Towels, bed sheets and laundry tallies', path: '/linen' },
    { title: 'Warehouse Stock', subtitle: 'Amenities, toiletries and supplies', path: '/warehouse' },
    { title: 'Telegram PINs', subtitle: 'Staff pairing keys and bot management', path: '/telegram-pin' },
    { title: 'Apartments Portfolio', subtitle: 'Properties, lockbox codes and Wi-Fi', path: '/apartments' },
    { title: 'Property Owners', subtitle: 'Investor directory and statements', path: '/people?tab=owners' }
  ];

  const filteredSearch = quickSearchItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Dark Slate Navigation Sidebar matching screenshots */}
      <Sidebar
        onOpenTelegramSimulator={() => setTelegramSimulatorOpen(true)}
        unreadAlertsCount={dashboardData?.priorityQueue?.length || 4}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          lastSyncTime={lastSyncTime}
          onSync={handleGlobalSync}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenSettings={() => navigate('/settings')}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  dashboardData={dashboardData}
                  onOpenTelegramSimulator={() => setTelegramSimulatorOpen(true)}
                  onRefresh={loadData}
                />
              }
            />
            <Route path="/calendar" element={<CalendarPage onActivityTriggered={loadData} />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/zones" element={<ZonesPage />} />
            <Route path="/cleaning-tomorrow" element={<CleaningTomorrowPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/linen" element={<LinenPage />} />
            <Route path="/warehouse" element={<WarehousePage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/extra-services" element={<ExtraServicesPage />} />
            <Route
              path="/telegram-pin"
              element={<TelegramPinPage onOpenSimulator={() => setTelegramSimulatorOpen(true)} />}
            />
            <Route path="/system-users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* Embedded Live Telegram Bot Simulator Modal */}
      <TelegramSimulatorModal
        isOpen={telegramSimulatorOpen}
        onClose={() => setTelegramSimulatorOpen(false)}
        onActivityTriggered={loadData}
      />

      {/* Global Quick Search (Ctrl+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm bg-transparent border-none outline-hidden text-slate-800 placeholder-slate-400"
              />
              <button onClick={() => setSearchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
              {filteredSearch.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setSearchModalOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Go ↵</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
