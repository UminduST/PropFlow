import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Plus, X } from 'lucide-react';
import { Zone, Apartment } from '../types/index.js';
import { api } from '../utils/api.js';

export const ZonesPage: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDesc, setNewZoneDesc] = useState('');

  const fetchData = async () => {
    try {
      const [zData, aData] = await Promise.all([
        api.getZones(),
        api.getApartments()
      ]);
      setZones(zData || []);
      setApartments(aData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;
    try {
      const res = await fetch('/api/apartments/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newZoneName, description: newZoneDesc })
      });
      if (res.ok) {
        setNewZoneName('');
        setNewZoneDesc('');
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1">Portfolio / Geography</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Zones & Areas</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Operational territories, districts, and apartment distribution.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Area</span>
        </button>
      </div>

      {/* Areas Grid matching screenshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => {
          const zoneApts = apartments.filter(a => a.areaId === zone.id);

          return (
            <div
              key={zone.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{zone.name}</h3>
                      <p className="text-xs text-slate-400">{zone.description || 'Property cluster area'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                    {zoneApts.length} {zoneApts.length === 1 ? 'Apartment' : 'Apartments'}
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Apartments
                  </div>
                  {zoneApts.length > 0 ? (
                    zoneApts.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-slate-800">{apt.name}</span>
                        </div>
                        <span className="text-slate-400">{apt.address}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400 italic">
                      No apartments assigned yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Zone Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Operational Area</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateZone} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Area Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. test area 3 or Downtown Marina"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Notes about location or logistics"
                  value={newZoneDesc}
                  onChange={(e) => setNewZoneDesc(e.target.value)}
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
                  Save Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
