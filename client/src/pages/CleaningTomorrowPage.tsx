import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Camera,
  Layers,
  AlertCircle,
  Plus,
  X,
  Upload,
  Check,
  Package
} from 'lucide-react';
import { CleaningJob, SystemUser } from '../types/index.js';
import { api } from '../utils/api.js';

export const CleaningTomorrowPage: React.FC = () => {
  const [cleanings, setCleanings] = useState<CleaningJob[]>([]);
  const [cleaners, setCleaners] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<CleaningJob | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoType, setPhotoType] = useState<'before' | 'after' | 'damage'>('after');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  const fetchCleanings = async () => {
    try {
      setLoading(true);
      const [cData, uData] = await Promise.all([
        api.getTomorrowCleanings(),
        api.getUsers()
      ]);
      setCleanings(cData || []);
      setCleaners((uData || []).filter((u: SystemUser) => u.role === 'cleaner'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleanings();
  }, []);

  const handleAssignCleaner = async (jobId: string, cleanerId: string) => {
    try {
      await api.assignCleaner(jobId, cleanerId);
      await fetchCleanings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleChecklist = async (jobId: string, itemId: string) => {
    try {
      await api.toggleChecklist(jobId, itemId);
      await fetchCleanings();
      if (selectedJob && selectedJob.id === jobId) {
        const updated = await api.getCleanings();
        const found = updated.find((j: CleaningJob) => j.id === jobId);
        if (found) setSelectedJob(found);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (jobId: string, status: string) => {
    try {
      await api.updateCleaningStatus(jobId, status);
      await fetchCleanings();
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPhoto = async () => {
    if (!selectedJob || !photoUrl.trim()) return;
    try {
      await api.addCleaningPhoto(selectedJob.id, {
        url: photoUrl,
        type: photoType,
        caption: photoCaption
      });
      setPhotoUrl('');
      setPhotoCaption('');
      setPhotoModalOpen(false);
      await fetchCleanings();
      const updated = await api.getCleanings();
      const found = updated.find((j: CleaningJob) => j.id === selectedJob.id);
      if (found) setSelectedJob(found);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1">Operations / Schedule</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Cleaning tomorrow</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {cleanings.length} Turnovers
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Scheduled check-out cleaning, cleaner assignments & linen requirements.
          </p>
        </div>
      </div>

      {/* Grid of Turnover Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cleanings.map((job) => {
          const completedCount = job.checklist.filter(i => i.completed).length;
          const totalCount = job.checklist.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Apartment & Time */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {job.areaName}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{job.apartmentName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.timeWindow}</span>
                      <span>•</span>
                      <span className="capitalize font-semibold text-slate-700">{job.type}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize ${
                      job.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Cleaner Assignment Dropdown */}
                <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">Assigned Cleaner:</span>
                  </div>
                  <select
                    value={job.cleanerId || ''}
                    onChange={(e) => handleAssignCleaner(job.id, e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden"
                  >
                    <option value="">Unassigned</option>
                    {cleaners.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Linen Required for this Turnover */}
                <div className="mt-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/60">
                  <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Linen Allocation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700">
                    <div className="bg-white p-2 rounded-xl text-center border border-blue-100">
                      <div className="font-bold text-slate-900">{job.linenUsed.bathTowels}</div>
                      <div className="text-slate-400 text-[10px]">Bath towels</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl text-center border border-blue-100">
                      <div className="font-bold text-slate-900">{job.linenUsed.handTowels}</div>
                      <div className="text-slate-400 text-[10px]">Hand towels</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl text-center border border-blue-100">
                      <div className="font-bold text-slate-900">{job.linenUsed.bedSheets}</div>
                      <div className="text-slate-400 text-[10px]">Bed sheets</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Checklist Summary */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">Turnover Checklist</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {completedCount}/{totalCount} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    ></div>
                  </div>
                </div>

                {/* Photos thumbnails preview */}
                {job.photos.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 overflow-x-auto py-1">
                    {job.photos.map((p) => (
                      <div key={p.id} className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img src={p.url} alt="Proof" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] text-center font-bold uppercase py-0.5">
                          {p.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  View Checklist
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setPhotoModalOpen(true);
                    }}
                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
                    title="Upload Inspection Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {job.status !== 'completed' ? (
                    <button
                      onClick={() => handleStatusChange(job.id, 'completed')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs shadow-emerald-600/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>Complete & Deduct Linen</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(job.id, 'inspected')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sign Off</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checklist Inspection Drawer / Modal */}
      {selectedJob && !photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Turnover Inspection</span>
                <h3 className="text-xl font-bold mt-0.5">{selectedJob.apartmentName}</h3>
                <p className="text-xs text-slate-400">{selectedJob.timeWindow} • Cleaner: {selectedJob.cleanerName || 'Unassigned'}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Room-By-Room Inspection
              </div>
              {selectedJob.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(selectedJob.id, item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    item.completed
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        item.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">
                        {item.room}
                      </span>
                      <span className="text-xs font-semibold">{item.task}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setPhotoModalOpen(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Upload Photos</span>
              </button>
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Upload Photo Proof</h3>
              <button onClick={() => setPhotoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Photo Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['before', 'after', 'damage'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPhotoType(t)}
                    className={`py-2 text-xs font-bold rounded-xl capitalize border transition-all ${
                      photoType === t
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPhotoUrl(
                      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80'
                    )
                  }
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Sample Living Room
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoUrl(
                      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80'
                    )
                  }
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Sample Bedroom
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes / Caption</label>
              <input
                type="text"
                placeholder="e.g. Master bed freshly made, towels folded"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPhoto}
                disabled={!photoUrl.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
