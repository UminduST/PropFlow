import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, ArrowUpDown, X } from 'lucide-react';
import { WarehouseItem } from '../types/index.js';
import { api } from '../utils/api.js';

export const WarehousePage: React.FC = () => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [adjustModal, setAdjustModal] = useState<WarehouseItem | null>(null);
  const [delta, setDelta] = useState<number>(10);
  const [reason, setReason] = useState('Restock shipment received');

  const fetchData = async () => {
    try {
      const data = await api.getWarehouse(category, search);
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, search]);

  const handleAdjust = async () => {
    if (!adjustModal) return;
    try {
      await api.adjustWarehouse(adjustModal.id, delta, reason);
      setAdjustModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1">Operations / Inventory</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Warehouse Supplies</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Amenities, cleaning chemicals, batteries and welcome packs.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search items or storage shelf..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
        >
          <option value="all">All Categories</option>
          <option value="Amenities">Amenities</option>
          <option value="Cleaning Supplies">Cleaning Supplies</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Beverages">Beverages</option>
        </select>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-4">Item Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">Stock Level</th>
              <th className="p-4">Unit Cost</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">{item.name}</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                </td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">{item.location}</td>
                <td className="p-4">
                  <span className={`font-bold ${item.quantity <= item.minThreshold ? 'text-rose-600' : 'text-slate-800'}`}>
                    {item.quantity} {item.unit}
                  </span>
                  {item.quantity <= item.minThreshold && (
                    <span className="ml-2 text-[10px] text-rose-500 font-semibold">(Low)</span>
                  )}
                </td>
                <td className="p-4 text-slate-600 font-semibold">${item.costPerUnit}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => {
                      setAdjustModal(item);
                      setDelta(10);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold text-xs"
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Adjust {adjustModal.name}</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Adjustment Delta (+/-)</label>
                <input
                  type="number"
                  value={delta}
                  onChange={(e) => setDelta(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setAdjustModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
