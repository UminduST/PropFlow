import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Plus,
  Send,
  CheckCircle2,
  FileText,
  X,
  Sparkles,
  Wrench
} from 'lucide-react';
import { Owner, SystemUser, Apartment } from '../types/index.js';
import { api } from '../utils/api.js';

export const PeoplePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'owners';

  const [owners, setOwners] = useState<Owner[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statementModal, setStatementModal] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [oData, uData, aData] = await Promise.all([
        api.getOwners(),
        api.getUsers(),
        api.getApartments()
      ]);
      setOwners(oData || []);
      setUsers(uData || []);
      setApartments(aData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleOpenStatement = async (ownerId: string) => {
    try {
      const data = await api.getOwnerStatement(ownerId);
      setStatementModal(data);
    } catch (err) {
      console.error(err);
    }
  };

  const cleaners = users.filter(u => u.role === 'cleaner');
  const technicians = users.filter(u => u.role === 'maintenance');

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-1">Portfolio / Directory</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">People & Staff</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Property owners, turnover cleaners, and maintenance specialists.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs w-fit">
        <button
          onClick={() => handleTabChange('owners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'owners'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Property Owners ({owners.length})
        </button>
        <button
          onClick={() => handleTabChange('cleaners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'cleaners'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cleaners ({cleaners.length})
        </button>
        <button
          onClick={() => handleTabChange('technicians')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'technicians'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Technicians ({technicians.length})
        </button>
      </div>

      {/* OWNERS TAB */}
      {currentTab === 'owners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 font-bold flex items-center justify-center text-sm">
                      {owner.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{owner.name}</h3>
                      <div className="text-xs text-slate-400">Commission Rate: {owner.commissionRate}%</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 capitalize">
                    {owner.status}
                  </span>
                </div>

                <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{owner.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{owner.phone}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Assigned Properties:</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {owner.apartmentIds?.length ?? 0} Apartments
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Monthly Net Payout:</span>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5 text-emerald-700">
                      ${owner.monthlyEarnings ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => handleOpenStatement(owner.id)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Statement</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLEANERS TAB */}
      {currentTab === 'cleaners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cleaners.map((cleaner) => (
            <div
              key={cleaner.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 font-bold flex items-center justify-center text-sm">
                    {cleaner.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cleaner.name}</h3>
                    <div className="text-xs text-slate-400">Cleaning Specialist</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  Active Staff
                </span>
              </div>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Telegram Bot Pairing:</span>
                  {cleaner.telegramChatId ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Paired</span>
                    </span>
                  ) : (
                    <span className="font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                      PIN: {cleaner.telegramPin || 'None'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cleaner.phone || '+1 (555) 444-1234'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TECHNICIANS TAB */}
      {currentTab === 'technicians' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {technicians.map((tech) => (
            <div
              key={tech.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-600 font-bold flex items-center justify-center text-sm">
                    {tech.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{tech.name}</h3>
                    <div className="text-xs text-slate-400">Maintenance & HVAC Contractor</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                  Contractor
                </span>
              </div>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Telegram Work Alerts:</span>
                  <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                    PIN: {tech.telegramPin || '593821'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tech.phone || '+1 (555) 888-9900'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Owner Financial Statement Modal */}
      {statementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Owner Statement</span>
                <h3 className="text-xl font-bold mt-0.5">{statementModal.owner.name}</h3>
              </div>
              <button onClick={() => setStatementModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Gross Reservations:</span>
                  <span className="font-bold text-slate-900">${statementModal.summary.totalGross}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Management Commission ({statementModal.summary.commissionRate}%):</span>
                  <span className="font-bold text-rose-600">-${statementModal.summary.managementCommission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Maintenance & Repairs:</span>
                  <span className="font-bold text-rose-600">-${statementModal.summary.maintenanceExpenses}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                  <span className="text-slate-900">Net Owner Payout:</span>
                  <span className="text-emerald-700 font-extrabold">${statementModal.summary.netPayout}</span>
                </div>
              </div>

              <div className="text-slate-400 text-[11px] text-center">
                Generated from live PropFlow reservation payouts and expense logs.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
