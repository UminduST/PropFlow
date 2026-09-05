import React, { useState, useEffect } from 'react';
import { Receipt, Plus, CheckCircle2, DollarSign, Calendar, User } from 'lucide-react';
import { ExtraService, Apartment } from '../types/index.js';
import { api } from '../utils/api.js';

export const ExtraServicesPage: React.FC = () => {
  const [services, setServices] = useState<ExtraService[]>([
    {
      id: 'srv-1',
      apartmentId: 'apt-2',
      apartmentName: 'test 2',
      guestName: 'Charlotte Dubois',
      serviceName: 'VIP Airport Transfer (Mercedes V-Class)',
      price: 110,
      date: '2026-08-28',
      status: 'completed'
    },
    {
      id: 'srv-2',
      apartmentId: 'apt-2',
      apartmentName: 'test 2',
      guestName: 'Charlotte Dubois',
      serviceName: 'Baby Cot & High Chair Setup',
      price: 35,
      date: '2026-08-28',
      status: 'completed'
    }
  ]);

  const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-1">Finance / Ancillary Revenue</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <span>Extra Services</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            ${totalRevenue} Billed
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Airport transfers, late checkouts, luggage storage, and rental baby cots.
        </p>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-4">Service</th>
              <th className="p-4">Apartment</th>
              <th className="p-4">Guest</th>
              <th className="p-4">Date</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((srv) => (
              <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>{srv.serviceName}</span>
                </td>
                <td className="p-4 font-medium text-slate-700">{srv.apartmentName}</td>
                <td className="p-4 text-slate-600">{srv.guestName}</td>
                <td className="p-4 text-slate-500">{srv.date}</td>
                <td className="p-4 font-bold text-emerald-700">${srv.price}</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 capitalize">
                    {srv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
