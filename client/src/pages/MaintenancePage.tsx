import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Plus,
  DollarSign,
  Camera,
  Filter,
  Search,
  X
} from 'lucide-react';
import { MaintenanceTask, Apartment, SystemUser } from '../types/index.js';
import { api } from '../utils/api.js';

export const MaintenancePage: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  // Form state
  const [form, setForm] = useState({
    apartmentId: '',
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
    estimatedBudget: 50,
    assigneeId: '',
    photoUrl: ''
  });

  const fetchData = async () => {
    try {
      const [tData, aData, uData] = await Promise.all([
        api.getMaintenance({ status: statusFilter, priority: priorityFilter }),
        api.getApartments(),
        api.getUsers()
      ]);
      setTasks(tData || []);
      setApartments(aData || []);
      setUsers(uData || []);
      if (aData?.length > 0 && !form.apartmentId) {
        setForm(prev => ({ ...prev, apartmentId: aData[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    try {
      await api.createMaintenance(form);
      setShowNewModal(false);
      setForm({
        apartmentId: apartments[0]?.id || '',
        title: '',
        description: '',
        category: 'General',
        priority: 'medium',
        estimatedBudget: 50,
        assigneeId: '',
        photoUrl: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId: string, status: string, actualCost?: number) => {
    try {
      await api.updateMaintenance(taskId, {
        status,
        ...(actualCost !== undefined && { actualCost })
      });
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
          <div className="text-xs font-semibold text-slate-400 mb-1">Operations / Facilities</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Maintenance Tasks</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {tasks.length} Tickets
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Track repairs, contractor assignments, budget expenses and proof photos.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_parts">Waiting Parts</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {task.apartmentName} ({task.areaName})
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                      {task.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{task.title}</h3>
                </div>

                {/* Priority Pill */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : task.priority === 'high'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{task.description}</p>

              {/* Photos */}
              {task.photos.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  {task.photos.map((p) => (
                    <div key={p.id} className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={p.url} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Budget & Cost Row */}
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Assignee:</span>
                  <div className="font-bold text-slate-800 mt-0.5">{task.assigneeName || 'Unassigned'}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Budget / Actual:</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    ${task.actualCost} <span className="text-slate-400">/ ${task.estimatedBudget}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 capitalize">
                Status: <strong className="text-slate-700">{task.status.replace('_', ' ')}</strong>
              </span>

              <div className="flex items-center gap-2">
                {task.status !== 'resolved' ? (
                  <button
                    onClick={() => handleStatusChange(task.id, 'resolved', task.estimatedBudget)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                ) : (
                  <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Maintenance Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Report Maintenance Defect</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Key/Lock">Key/Lock</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shower drain clogged in bathroom 1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe location, symptoms and any parts needed"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">🚨 Urgent (Telegram Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimated Budget ($)</label>
                  <input
                    type="number"
                    value={form.estimatedBudget}
                    onChange={(e) => setForm({ ...form, estimatedBudget: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Photo Evidence URL</label>
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
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
