import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Plus, Search, CheckCircle2, User, MapPin, X, Camera } from 'lucide-react';
import { LostItem, Apartment } from '../types/index.js';
import { api } from '../utils/api.js';

export const AlertsPage: React.FC = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    apartmentId: '',
    itemName: '',
    category: 'Accessories',
    description: '',
    foundBy: 'Staff Cleaner',
    guestName: '',
    storageLocation: 'Operations Safe Box #04',
    photoUrl: ''
  });

  const fetchData = async () => {
    try {
      const [lData, aData] = await Promise.all([
        api.getLostItems({ status: statusFilter }),
        api.getApartments()
      ]);
      setLostItems(lData || []);
      setApartments(aData || []);
      if (aData?.length > 0 && !form.apartmentId) {
        setForm(prev => ({ ...prev, apartmentId: aData[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName) return;
    try {
      await api.createLostItem(form);
      setShowModal(false);
      setForm({
        apartmentId: apartments[0]?.id || '',
        itemName: '',
        category: 'Accessories',
        description: '',
        foundBy: 'Staff Cleaner',
        guestName: '',
        storageLocation: 'Operations Safe Box #04',
        photoUrl: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.updateLostItem(id, { status });
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
          <div className="text-xs font-semibold text-slate-400 mb-1">Operations / Incident Alerts</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Lost & Found Alarms</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              {lostItems.length} Registered Items
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Items forgotten by guests during departures, locker storage & admin follow-up.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Lost Item</span>
        </button>
      </div>

      {/* Grid of Lost Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lostItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.apartmentName} • Found {item.foundDate}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.itemName}</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'reported'
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : item.status === 'guest_contacted'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2">{item.description}</p>

              {/* Photo preview */}
              {item.photoUrl && (
                <div className="mt-4 w-full h-40 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                  <img src={item.photoUrl} alt="Lost item" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Finder:</span>
                  <span className="font-semibold text-slate-700">{item.foundBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Location:</span>
                  <span className="font-mono font-bold text-slate-800">{item.storageLocation}</span>
                </div>
                {item.guestName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Guest:</span>
                    <span className="font-semibold text-blue-600">{item.guestName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Category: {item.category}</span>
              <div className="flex items-center gap-2">
                {item.status === 'reported' && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, 'guest_contacted')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                  >
                    Mark Contacted
                  </button>
                )}
                {item.status === 'guest_contacted' && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, 'claimed')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Mark Claimed / Returned
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Report Left / Lost Item</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Apartment *</label>
                <select
                  value={form.apartmentId}
                  onChange={(e) => setForm({ ...form, apartmentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                >
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.areaName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple AirPods Pro with white case"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description & Location Found</label>
                <textarea
                  rows={2}
                  placeholder="Found under living room armchair"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Documents">Documents</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Safe Locker</label>
                  <input
                    type="text"
                    value={form.storageLocation}
                    onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Photo URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
