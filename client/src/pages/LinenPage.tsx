import React, { useState, useEffect } from 'react';
import { Shirt, AlertTriangle, RefreshCw, Plus, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import { LinenItem } from '../types/index.js';
import { api } from '../utils/api.js';

export const LinenPage: React.FC = () => {
  const [linen, setLinen] = useState<LinenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LinenItem | null>(null);
  const [actionType, setActionType] = useState<'return_laundry' | 'send_laundry' | 'restock_new'>('return_laundry');
  const [qtyInput, setQtyInput] = useState<number>(20);

  const fetchLinen = async () => {
    try {
      setLoading(true);
      const data = await api.getLinen();
      setLinen(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinen();
  }, []);

  const handleAdjust = async () => {
    if (!selectedItem || qtyInput <= 0) return;
    try {
      await api.adjustLinen(selectedItem.id, actionType, qtyInput);
      setSelectedItem(null);
      fetchLinen();
    } catch (err) {
      console.error(err);
    }
  };

  const lowStockCount = linen.filter(l => l.clean <= l.minThreshold).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-1">Operations / Inventory</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <span>Linen Stock Management</span>
          {lowStockCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
              {lowStockCount} Low Stock Alerts
            </span>
          )}
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Monitor clean inventory, dirty laundry batches, and automatic turnover consumption.
        </p>
      </div>

      {/* Linen Items Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {linen.map((item) => {
          const isCritical = item.clean <= item.minThreshold;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                isCritical ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      isCritical ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Shirt className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                      <div className="text-[11px] text-slate-400">Total in circulation: {item.total} {item.unit}</div>
                    </div>
                  </div>

                  {isCritical && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Stock Counters */}
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {/* Clean */}
                  <div className={`p-3 rounded-2xl border ${
                    isCritical ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                  }`}>
                    <div className="text-2xl font-extrabold">{item.clean}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">Clean Ready</div>
                  </div>

                  {/* Dirty */}
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900">
                    <div className="text-2xl font-extrabold">{item.dirty}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">Dirty Laundry</div>
                  </div>

                  {/* In Transit */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700">
                    <div className="text-2xl font-extrabold">{item.inTransit}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">In Transit</div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Minimum Threshold: {item.minThreshold} {item.unit}</span>
                  {item.clean === 0 && (
                    <span className="text-rose-600 font-bold">● 0 remaining!</span>
                  )}
                </div>
              </div>

              {/* Adjust Stock Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setActionType('return_laundry');
                    setQtyInput(item.dirty || 10);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Return Clean
                </button>

                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setActionType('restock_new');
                    setQtyInput(20);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Adjust {selectedItem.name}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Action</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2"
                >
                  <option value="return_laundry">Return Clean from Laundry Service</option>
                  <option value="send_laundry">Send Dirty to Laundry</option>
                  <option value="restock_new">Restock Brand New Linen</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Quantity (Pieces)</label>
                <input
                  type="number"
                  min="1"
                  value={qtyInput}
                  onChange={(e) => setQtyInput(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
