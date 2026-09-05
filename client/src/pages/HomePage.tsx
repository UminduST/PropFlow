import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Sparkles,
  MapPin,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Clock,
  PlusCircle,
  Wrench,
  Shirt,
  Bot,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DashboardData } from '../types/index.js';
import { api } from '../utils/api.js';

interface HomePageProps {
  onOpenTelegramSimulator?: () => void;
  dashboardData?: DashboardData | null;
  onRefresh?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenTelegramSimulator,
  dashboardData: initialData,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      loadDashboard();
    }
  }, [initialData]);

  const handleExport = (type: 'apartments' | 'bookings' | 'maintenance', format: 'csv' | 'excel' | 'pdf') => {
    setDownloading(`${type}-${format}`);
    // Trigger download via direct server endpoint
    window.open(`/api/exports/${type}/${format}`, '_blank');
    setTimeout(() => setDownloading(null), 1000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Home / Breadcrumb */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-1">Home</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Good morning.</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Your live property overview for today.</p>
      </div>

      {/* Row 1: Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Apartments */}
        <div
          onClick={() => navigate('/apartments')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Apartments</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {data?.stats.apartments ?? 2}
          </div>
        </div>

        {/* Card 2: Owners */}
        <div
          onClick={() => navigate('/people?tab=owners')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Owners</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {data?.stats.owners ?? 4}
          </div>
        </div>

        {/* Card 3: Active apartments */}
        <div
          onClick={() => navigate('/apartments')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active apartments</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {data?.stats.activeApartments ?? 2}
          </div>
        </div>

        {/* Card 4: Areas */}
        <div
          onClick={() => navigate('/zones')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Areas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {data?.stats.areas ?? 2}
          </div>
        </div>
      </div>

      {/* Row 2: Middle Split (Weekly turnover load + Priority Queue) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Weekly turnover load */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                RESERVATIONS
              </span>
              <span className="text-xs bg-slate-100 font-medium px-2.5 py-1 rounded-lg text-slate-600">
                This week
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">Weekly turnover load</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {data?.weeklyTurnover.totalScheduled ?? 2}
              </span>
              <span className="text-xs text-slate-400">scheduled check-outs Live reservation data</span>
            </div>
          </div>

          {/* Bar Chart Recreation matching Image 1 */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-7 gap-3 h-36 items-end pb-2">
              {[
                { day: 'Mon', active: false, count: 0 },
                { day: 'Tue', active: false, count: 0 },
                { day: 'Wed', active: false, count: 0 },
                { day: 'Thu', active: true, count: 1, height: '70%' },
                { day: 'Fri', active: false, count: 0 },
                { day: 'Sat', active: false, count: 0 },
                { day: 'Sun', active: true, count: 1, height: '85%' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div
                    style={{ height: item.active ? item.height : '25%' }}
                    className={`w-full rounded-lg transition-all duration-300 ${
                      item.active
                        ? 'bg-[#334155] group-hover:bg-[#1e293b]'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  ></div>
                  <span className="text-xs font-semibold text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Priority Queue (Black Card matching Image 1) */}
        <div className="bg-[#111827] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              PRIORITY QUEUE
            </div>
            <h2 className="text-base font-bold text-white mb-4">Needs attention</h2>

            {/* Low stock alert items matching screenshots */}
            <div className="space-y-3.5">
              {[
                { name: 'Bath towels', remaining: 0 },
                { name: 'Hand towels', remaining: 0 },
                { name: 'Bed sheets', remaining: 0 },
                { name: 'Pillowcases', remaining: 0 }
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/linen')}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/80 hover:bg-slate-800/40 px-1 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">
                        Linen stock is low
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.name} · {item.remaining} pieces remaining
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Button: Open calendar -> */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate('/calendar')}
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Open calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Operational Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CHECK-INS TODAY */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            CHECK-INS TODAY
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {data?.operationalMetrics.checkInsToday ?? 2}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {data?.operationalMetrics.checkInsLabel ?? 'No upcoming arrivals'}
            </span>
          </div>
        </div>

        {/* CHECK-OUTS TODAY */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            CHECK-OUTS TODAY
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {data?.operationalMetrics.checkOutsToday ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {data?.operationalMetrics.checkOutsLabel ?? '0 completed'}
            </span>
          </div>
        </div>

        {/* OCCUPANCY NOW */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            OCCUPANCY NOW
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {data?.operationalMetrics.occupancyNow ?? 100}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {data?.operationalMetrics.occupancyLabel ?? '2 of 2 occupied'}
            </span>
          </div>
        </div>

        {/* BOOKINGS THIS MONTH */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            BOOKINGS THIS MONTH
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-900">
              {data?.operationalMetrics.bookingsThisMonth ?? 3}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {data?.operationalMetrics.bookingsThisMonthLabel ?? 'Confirmed arrivals'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 4: Reports & Exports (Exact match from Image 2) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            REPORTING
          </div>
          <h2 className="text-base font-bold text-slate-900">Reports & exports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download current operational data for analysis, accounting, or sharing.
          </p>
        </div>

        <div className="space-y-4">
          {/* Row 1: Apartments */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-colors gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Apartments</div>
                <div className="text-[11px] text-slate-400">Portfolio, owners, capacity and status</div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handleExport('apartments', 'csv')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('apartments', 'excel')}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExport('apartments', 'pdf')}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Row 2: Bookings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-colors gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Bookings</div>
                <div className="text-[11px] text-slate-400">Dates, guests, sources and status</div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handleExport('bookings', 'csv')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('bookings', 'excel')}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExport('bookings', 'pdf')}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Row 3: Maintenance */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-colors gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Maintenance</div>
                <div className="text-[11px] text-slate-400">Issues, assignees, budgets and progress</div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handleExport('maintenance', 'csv')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('maintenance', 'excel')}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExport('maintenance', 'pdf')}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Summary by Area (Matching Image 2) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Summary by area</h2>
            <div className="text-xs text-slate-400">Live apartment distribution</div>
          </div>
          <button
            onClick={() => navigate('/zones')}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors shadow-2xs"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* test area 1 */}
          <div
            onClick={() => navigate('/apartments?area=zone-1')}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">test area 1</span>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">1</div>
              <div className="text-xs text-slate-400 mt-1">1 apartment</div>
            </div>
          </div>

          {/* test area 2 */}
          <div
            onClick={() => navigate('/apartments?area=zone-2')}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">test area 2</span>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">1</div>
              <div className="text-xs text-slate-400 mt-1">1 apartment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 6: Split Bottom (Live log + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Live Log / Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            LIVE LOG
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Recent activity</h2>

          <div className="space-y-3">
            {(data?.recentActivity || [
              {
                id: '1',
                action: 'SYNC',
                title: 'Reservation synchronized',
                details: 'test 1',
                timestamp: '4 minutes ago'
              }
            ]).slice(0, 5).map((log, index) => (
              <div
                key={log.id || index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    RS
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{log.title}</div>
                    <div className="text-[11px] text-slate-500">{log.details}</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {log.timestamp.includes('T')
                    ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick actions */}
        <div className="bg-[#111827] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              SHORTCUTS
            </div>
            <h2 className="text-base font-bold text-white mb-4">Quick actions</h2>
            <div className="text-xs text-slate-400 mb-4">Available management tasks</div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/cleaning-tomorrow')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Assign Cleaning Tomorrow</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/maintenance')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Report Maintenance Ticket</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/linen')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Shirt className="w-4 h-4 text-sky-400" />
                  <span>Restock Linen Supplies</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {onOpenTelegramSimulator && (
                <button
                  onClick={onOpenTelegramSimulator}
                  className="w-full text-left p-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-semibold text-sky-200 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Bot className="w-4 h-4 text-sky-400" />
                    <span>Open Telegram Cleaner Bot</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-300" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
