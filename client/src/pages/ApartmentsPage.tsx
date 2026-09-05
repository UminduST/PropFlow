import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  KeyRound,
  Wifi,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  X,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Apartment, Zone, Owner } from '../types/index.js';
import { api } from '../utils/api.js';

export const ApartmentsPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  // New Apartment Form State
  const [formData, setFormData] = useState({
    name: '',
    areaId: '',
    address: '',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    keyLockboxCode: '',
    smartLockPin: '',
    wifiSsid: '',
    wifiPassword: '',
    ownerId: '',
    imageUrl: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [aData, zData, oData] = await Promise.all([
        api.getApartments({ areaId: selectedArea, status: selectedStatus, search }),
        api.getZones(),
        api.getOwners()
      ]);
      setApartments(aData || []);
      setZones(zData || []);
      setOwners(oData || []);
      if (zData?.length > 0 && !formData.areaId) {
        setFormData(prev => ({ ...prev, areaId: zData[0].id }));
      }
      if (oData?.length > 0 && !formData.ownerId) {
        setFormData(prev => ({ ...prev, ownerId: oData[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedArea, selectedStatus, search]);

  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      await api.createApartment(formData);
      setShowModal(false);
      setFormData({
        name: '',
        areaId: zones[0]?.id || '',
        address: '',
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        keyLockboxCode: '',
        smartLockPin: '',
        wifiSsid: '',
        wifiPassword: '',
        ownerId: owners[0]?.id || '',
        imageUrl: '',
        notes: ''
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1">Portfolio / Properties</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Apartments</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage your property portfolio, door access codes, Wi-Fi and owner relations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Apartment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, address or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Areas</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Apartment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apartments.map((apt) => (
          <div
            key={apt.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Image & Status Badge */}
              <div className="h-48 relative overflow-hidden bg-slate-100">
                <img
                  src={apt.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'}
                  alt={apt.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-800 shadow-xs flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>{apt.areaName}</span>
                </div>
                <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {apt.status}
                </div>
              </div>

              {/* Body details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">{apt.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{apt.address}</p>

                {/* Specs */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 mt-4 pb-4 border-b border-slate-100">
                  <span>🛏️ {apt.bedrooms} Bedrooms</span>
                  <span>🚿 {apt.bathrooms} Baths</span>
                  <span>👥 Up to {apt.maxGuests} Guests</span>
                </div>

                {/* Door Access & Lockbox Codes */}
                <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-amber-500" />
                      <span>Lockbox PIN</span>
                    </div>
                    <div className="font-mono font-bold text-sm text-slate-800 mt-0.5">
                      {apt.keyLockboxCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-blue-500" />
                      <span>Smart Lock</span>
                    </div>
                    <div className="font-mono font-bold text-sm text-slate-800 mt-0.5">
                      {apt.smartLockPin || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Wi-Fi & Owner */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Wifi className="w-3 h-3 text-blue-500" />
                      Wi-Fi:
                    </span>
                    <span className="font-medium text-slate-700 font-mono text-[11px]">
                      {apt.wifiSsid} ({apt.wifiPassword})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3 h-3 text-indigo-500" />
                      Owner:
                    </span>
                    <span className="font-semibold text-slate-800">{apt.ownerName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedApartment(apt)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Apartment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Add New Apartment</h3>
                <p className="text-xs text-slate-400">Create property profile, access codes and assignment</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApartment} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Apartment Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. test 3 or Marina Suite 101"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Area / Zone *</label>
                  <select
                    value={formData.areaId}
                    onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Address</label>
                <input
                  type="text"
                  placeholder="Street name, building and unit number"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lockbox Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 4829"
                    value={formData.keyLockboxCode}
                    onChange={(e) => setFormData({ ...formData, keyLockboxCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Smart Lock PIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 9012#"
                    value={formData.smartLockPin}
                    onChange={(e) => setFormData({ ...formData, smartLockPin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Wi-Fi SSID</label>
                  <input
                    type="text"
                    placeholder="Network Name"
                    value={formData.wifiSsid}
                    onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Wi-Fi Password</label>
                  <input
                    type="text"
                    placeholder="Secret Password"
                    value={formData.wifiPassword}
                    onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Property Owner</label>
                <select
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                >
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.commissionRate}% comm.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Save Apartment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Full Details Modal */}
      {selectedApartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedApartment.areaName}
                </span>
                <h3 className="text-xl font-bold">{selectedApartment.name}</h3>
              </div>
              <button onClick={() => setSelectedApartment(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-slate-400 font-medium">Address:</div>
                <div className="font-bold text-slate-800 text-sm">{selectedApartment.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400">Lockbox Code:</div>
                  <div className="font-mono font-bold text-base text-blue-600">{selectedApartment.keyLockboxCode}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400">Smart Lock PIN:</div>
                  <div className="font-mono font-bold text-base text-blue-600">{selectedApartment.smartLockPin || 'N/A'}</div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-slate-400 font-medium">Wi-Fi Credentials:</div>
                <div className="font-semibold text-slate-800">SSID: {selectedApartment.wifiSsid}</div>
                <div className="font-mono text-slate-700">Password: {selectedApartment.wifiPassword}</div>
              </div>
              {selectedApartment.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                  <div className="font-bold uppercase text-[10px] mb-0.5">Staff Notes</div>
                  <p>{selectedApartment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
