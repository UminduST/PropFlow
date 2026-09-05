import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Plus,
  X,
  User,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Booking, Apartment, BookingSource } from '../types/index.js';
import { api } from '../utils/api.js';

interface CalendarPageProps {
  onActivityTriggered?: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onActivityTriggered }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'monthly' | 'list'>('timeline');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  // Date range anchor (Starting Aug 28, 2026 to match screenshot)
  const [anchorDate, setAnchorDate] = useState<Date>(new Date('2026-08-28T00:00:00'));

  const fetchData = async () => {
    try {
      const [bData, aData] = await Promise.all([
        api.getBookings(),
        api.getApartments()
      ]);
      setBookings(bData.bookings || []);
      setApartments(aData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncNow();
      await fetchData();
      if (onActivityTriggered) onActivityTriggered();
    } finally {
      setTimeout(() => setSyncing(false), 500);
    }
  };

  // Generate 31 timeline days from anchor date
  const timelineDays = useMemo(() => {
    const days: Array<{
      dateStr: string;
      dayNumber: number;
      dayLetter: string;
      monthLabel?: string;
      isFirstOfMonth?: boolean;
    }> = [];

    const curr = new Date(anchorDate);
    for (let i = 0; i < 31; i++) {
      const d = new Date(curr);
      d.setDate(curr.getDate() + i);

      const dayNumber = d.getDate();
      const monthShort = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const dayLetter = dayLetters[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      days.push({
        dateStr,
        dayNumber,
        dayLetter,
        monthLabel: i === 0 || dayNumber === 1 ? (dayNumber === 1 ? `1 ${monthShort}` : `${dayNumber} ${monthShort}`) : undefined,
        isFirstOfMonth: dayNumber === 1
      });
    }
    return days;
  }, [anchorDate]);

  // Channel source badge colors
  const sourceColors: Record<BookingSource, { bg: string; text: string; dot: string; bar: string }> = {
    'Airbnb': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-[#FF5A5F]', bar: 'bg-[#FF5A5F] text-white hover:bg-rose-600' },
    'Booking.com': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-[#003580]', bar: 'bg-[#003580] text-white hover:bg-blue-900' },
    'Guesty': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-[#10b981]', bar: 'bg-[#10b981] text-white hover:bg-emerald-600' },
    'Direct': { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-[#ec4899]', bar: 'bg-[#ec4899] text-white hover:bg-pink-600' },
    'Lodgify': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-[#f59e0b]', bar: 'bg-[#f59e0b] text-white hover:bg-amber-600' },
    'Other': { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-[#6b7280]', bar: 'bg-[#6b7280] text-white hover:bg-slate-700' }
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchApt = selectedApartment === 'all' || b.apartmentId === selectedApartment;
      const matchSrc = selectedSource === 'all' || b.source.toLowerCase() === selectedSource.toLowerCase();
      const matchQuery =
        !searchQuery ||
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.apartmentName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchApt && matchSrc && matchQuery;
    });
  }, [bookings, selectedApartment, selectedSource, searchQuery]);

  // Navigate timeline dates
  const handlePrev = () => {
    const next = new Date(anchorDate);
    next.setDate(next.getDate() - 14);
    setAnchorDate(next);
  };
  const handleNext = () => {
    const next = new Date(anchorDate);
    next.setDate(next.getDate() + 14);
    setAnchorDate(next);
  };
  const handleToday = () => {
    setAnchorDate(new Date('2026-08-28T00:00:00'));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header / Breadcrumb matching Image 3 */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-1">Home / Calendar</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Booking calendar.</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {bookings.length} reservations upcoming across synchronized apartment calendars.
        </p>
      </div>

      {/* Controls Bar matching Image 3 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: View Tabs [Monthly] [Timeline] [List] */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'monthly'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'timeline'
                ? 'bg-blue-600 text-white shadow-2xs shadow-blue-500/20'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            List
          </button>
        </div>

        {/* Center / Right: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Find an apartment search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Find an apartment"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>

          {/* All apartments dropdown */}
          <select
            value={selectedApartment}
            onChange={(e) => setSelectedApartment(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All apartments</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.areaName})
              </option>
            ))}
          </select>

          {/* All sources dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All sources</option>
            <option value="airbnb">Airbnb</option>
            <option value="booking.com">Booking.com</option>
            <option value="guesty">Guesty</option>
            <option value="direct">Direct</option>
            <option value="lodgify">Lodgify</option>
            <option value="other">Other</option>
          </select>

          <button
            onClick={fetchData}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Legend & Channel Badges line matching Image 3 */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        {/* Source Badges */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A5F]"></span>
            <span>Airbnb</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003580]"></span>
            <span>Booking.com</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            <span>Guesty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]"></span>
            <span>Direct</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
            <span>Lodgify</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6b7280]"></span>
            <span>Other</span>
          </div>
        </div>

        {/* Sync Controls on right */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Last sync 5 minutes ago</span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-70"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync now</span>
          </button>
        </div>
      </div>

      {/* TIMELINE VIEW (Matching Image 3) */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Timeline Date Navigation Banner */}
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">
                Aug 28 – Sep 27, 2026
              </div>
              <div className="text-xs text-slate-400">
                {filteredBookings.length} visible reservations
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timeline Scrollable Grid Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              {/* Header Row: Days */}
              <div className="grid grid-cols-[180px_repeat(31,minmax(28px,1fr))] border-b border-slate-200/80 bg-slate-50/70 text-[11px]">
                <div className="p-3 font-bold uppercase text-slate-400 border-r border-slate-200/60">
                  APARTMENT
                </div>
                {timelineDays.map((td, idx) => (
                  <div
                    key={idx}
                    className={`py-2 px-0.5 text-center border-r border-slate-200/50 flex flex-col items-center justify-between ${
                      td.isFirstOfMonth ? 'bg-blue-50/50 font-bold' : ''
                    }`}
                  >
                    <span className="font-bold text-slate-700 text-[10px] leading-tight">
                      {td.monthLabel || td.dayNumber}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {td.dayLetter}
                    </span>
                  </div>
                ))}
              </div>

              {/* Apartment Rows */}
              {apartments.map((apt) => {
                const aptBookings = filteredBookings.filter((b) => b.apartmentId === apt.id);
                return (
                  <div
                    key={apt.id}
                    className="grid grid-cols-[180px_repeat(31,minmax(28px,1fr))] border-b border-slate-100 items-center min-h-[64px] relative hover:bg-slate-50/40 transition-colors"
                  >
                    {/* Apartment Name Column */}
                    <div className="p-3 border-r border-slate-200/60 z-10 bg-white">
                      <div className="font-bold text-xs text-slate-900">{apt.name}</div>
                      <div className="text-[10px] text-slate-400">{apt.areaName}</div>
                    </div>

                    {/* 31 background day slots */}
                    {timelineDays.map((td, dIdx) => (
                      <div
                        key={dIdx}
                        className="h-full border-r border-slate-100/80 hover:bg-blue-50/20 transition-colors"
                      ></div>
                    ))}

                    {/* Floating Reservation Bars */}
                    {aptBookings.map((booking) => {
                      const startIndex = timelineDays.findIndex((td) => td.dateStr === booking.startDate);
                      const endIndex = timelineDays.findIndex((td) => td.dateStr === booking.endDate);

                      // Calculate span
                      const colStart = startIndex !== -1 ? startIndex + 2 : 2;
                      const colEnd = endIndex !== -1 ? endIndex + 2 : (startIndex !== -1 ? startIndex + 5 : 6);
                      const span = Math.max(1, colEnd - colStart);

                      if (startIndex === -1 && endIndex === -1) return null;

                      const colors = sourceColors[booking.source] || sourceColors.Other;

                      return (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          style={{
                            gridColumn: `${colStart} / span ${span}`,
                          }}
                          className={`absolute z-20 mx-0.5 my-auto h-9 rounded-lg px-2 text-[11px] font-medium flex items-center justify-between cursor-pointer shadow-xs transition-transform hover:scale-[1.01] ${colors.bar}`}
                          title={`${booking.guestName} (${booking.source}) - ${booking.startDate} to ${booking.endDate}`}
                        >
                          <span className="truncate font-semibold text-white">
                            {booking.startDate.substring(5)} – {booking.endDate.substring(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Apartment</th>
                <th className="p-3.5">Guest</th>
                <th className="p-3.5">Dates</th>
                <th className="p-3.5">Source</th>
                <th className="p-3.5">Payout</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{b.apartmentName}</td>
                  <td className="p-3.5 font-medium text-slate-800">{b.guestName}</td>
                  <td className="p-3.5 text-slate-500">
                    {b.startDate} to {b.endDate}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      <span className={`w-1.5 h-1.5 rounded-full ${sourceColors[b.source]?.dot || 'bg-slate-400'}`}></span>
                      {b.source}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">${b.payout}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MONTHLY VIEW */}
      {viewMode === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <div className="text-sm font-bold text-slate-900 mb-4">August – September 2026 Calendar Grid</div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = (i % 31) + 1;
              const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
              const dayBookings = filteredBookings.filter(b => b.startDate <= dateStr && b.endDate >= dateStr);

              return (
                <div key={i} className="min-h-24 p-2 bg-slate-50/70 border border-slate-100 rounded-xl flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-600">{dayNum}</span>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map(b => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className={`text-[9px] p-1 rounded font-semibold truncate cursor-pointer text-white ${sourceColors[b.source]?.bar || 'bg-slate-700'}`}
                      >
                        {b.apartmentName} · {b.guestName.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reservation Details Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Reservation Details
                </span>
                <h3 className="text-xl font-bold mt-0.5">{selectedBooking.guestName}</h3>
                <p className="text-xs text-slate-300">{selectedBooking.apartmentName} ({selectedBooking.areaName})</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Timing & Channel Badge */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-slate-400 font-medium">Check-in</div>
                  <div className="text-sm font-bold text-slate-800">{selectedBooking.startDate}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Check-out (Turnover)</div>
                  <div className="text-sm font-bold text-slate-800">{selectedBooking.endDate}</div>
                </div>
              </div>

              {/* Source & Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400">Channel</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedBooking.source}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400">Guests</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedBooking.guestCount} Guests</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400">Payout</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">${selectedBooking.payout}</div>
                </div>
              </div>

              {/* Guest Contacts */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-700 text-xs">Contact Information</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedBooking.guestEmail || 'email-not-provided@ota.com'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedBooking.guestPhone || '+1 (555) 000-0000'}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900">
                  <div className="font-bold text-[11px] uppercase tracking-wider mb-1">Guest Notes</div>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}

              {/* Turnover Link CTA */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Turnover Cleaning:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Scheduled for {selectedBooking.endDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
