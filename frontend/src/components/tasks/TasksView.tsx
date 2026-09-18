'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-client';
import {
  CheckSquare, Plus, Trash2, Edit2, Check, Clock, AlertCircle,
  History, Calendar, FileText, Copy, Share2, Sparkles, CheckCircle2, ListTodo
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  updated_at?: string;
}

interface DailyLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  dateFormatted: string;
  tasksDone: TaskItem[];
  tasksInProgress: TaskItem[];
  reflectionNote: string;
}

interface TasksViewProps {
  defaultTab?: 'board' | 'logs';
}

export default function TasksView({ defaultTab = 'board' }: TasksViewProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'logs'>(defaultTab);
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_kanban_tasks');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [
      { id: '1', title: 'Setup Monorepo & FastAPI JWT Auth', description: 'Backend authentication and Database schema setup.', status: 'done', priority: 'high', updated_at: '2026-09-18T10:00:00Z' },
      { id: '2', title: 'Build Kanban Task Board & Daily Log', description: 'Enable inline task writing, editing, status workflow, and daily logs.', status: 'in_progress', priority: 'urgent', updated_at: '2026-09-19T01:00:00Z' },
      { id: '3', title: 'Flowchart Editor & React Flow', description: 'Interactive diagramming canvas.', status: 'todo', priority: 'medium', updated_at: '2026-09-19T02:00:00Z' },
    ];
  });

  // Daily Logs persistent state
  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_daily_task_logs');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const todayFormatted = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return [
      {
        id: 'log-1',
        date: todayStr,
        dateFormatted: todayFormatted,
        tasksDone: [
          { id: '1', title: 'Setup Monorepo & FastAPI JWT Auth', description: 'Backend authentication and Database schema setup.', status: 'done', priority: 'high' }
        ],
        tasksInProgress: [
          { id: '2', title: 'Build Kanban Task Board & Daily Log', description: 'Enable inline task writing, editing, status workflow, and daily logs.', status: 'in_progress', priority: 'urgent' }
        ],
        reflectionNote: 'Integrasi backend authentication sukses. Hari ini fokus menyelesaikan modul Kanban dan Log Kegiatan Harian.'
      }
    ];
  });

  const [selectedLogDate, setSelectedLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Sync tasks and daily logs to LocalStorage
  useEffect(() => {
    localStorage.setItem('nexus_kanban_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nexus_daily_task_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  // Fetch tasks from database
  const fetchTasks = async () => {
    try {
      const data = await apiRequest<TaskItem[]>('/tasks');
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const nowIso = new Date().toISOString();
    try {
      const newTask = await apiRequest<TaskItem>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle,
          description: 'New task details',
          status: 'todo',
          priority: 'medium',
        }),
      });
      setTasks([{ ...newTask, updated_at: nowIso }, ...tasks]);
    } catch (err) {
      const localTask: TaskItem = {
        id: Date.now().toString(),
        title: newTaskTitle,
        description: 'New task details',
        status: 'todo',
        priority: 'medium',
        updated_at: nowIso,
      };
      setTasks([localTask, ...tasks]);
    }
    setNewTaskTitle('');
  };

  const handleMoveStatus = async (id: string, newStatus: TaskItem['status']) => {
    const nowIso = new Date().toISOString();
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus, updated_at: nowIso } : t)));
    try {
      await apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {}
  };

  const handleStartEdit = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
  };

  const handleSaveEdit = async (id: string) => {
    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: editTitle, description: editDesc, updated_at: nowIso } : t))
    );
    setEditingTaskId(null);

    try {
      await apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, description: editDesc }),
      });
    } catch (err) {}
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // SNAPSHOT LOG HARIAN MANUAL / OTOMATIS
  const handleSnapshotDailyLog = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayFormatted = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const currentDone = tasks.filter((t) => t.status === 'done');
    const currentInProgress = tasks.filter((t) => t.status === 'in_progress');

    const existingIndex = dailyLogs.findIndex((l) => l.date === todayStr);

    if (existingIndex >= 0) {
      const updated = [...dailyLogs];
      updated[existingIndex] = {
        ...updated[existingIndex],
        tasksDone: currentDone,
        tasksInProgress: currentInProgress,
      };
      setDailyLogs(updated);
    } else {
      const newEntry: DailyLogEntry = {
        id: `log-${Date.now()}`,
        date: todayStr,
        dateFormatted: todayFormatted,
        tasksDone: currentDone,
        tasksInProgress: currentInProgress,
        reflectionNote: '',
      };
      setDailyLogs([newEntry, ...dailyLogs]);
    }

    setSelectedLogDate(todayStr);
    alert('Log kegiatan harian hari ini berhasil disimpan dan diperbarui!');
  };

  const handleSaveReflection = (dateStr: string, note: string) => {
    setDailyLogs((prev) =>
      prev.map((log) => (log.date === dateStr ? { ...log, reflectionNote: note } : log))
    );
  };

  const handleCopyDailyReport = (log: DailyLogEntry) => {
    const reportText = `📋 LOG KEGIATAN HARIAN — ${log.dateFormatted}

✅ SELESAI (${log.tasksDone.length} Tugas):
${log.tasksDone.map((t, idx) => `${idx + 1}. [DONE] ${t.title}${t.description ? ` - ${t.description}` : ''}`).join('\n')}

🔄 SEDANG DIKERJAKAN (${log.tasksInProgress.length} Tugas):
${log.tasksInProgress.map((t, idx) => `${idx + 1}. [IN PROGRESS] ${t.title}`).join('\n')}

📝 CATATAN / REFLEKSI HARIAN:
${log.reflectionNote || 'Tidak ada catatan khusus.'}
`;

    navigator.clipboard.writeText(reportText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const activeLog = dailyLogs.find((l) => l.date === selectedLogDate) || {
    id: 'temp',
    date: selectedLogDate,
    dateFormatted: new Date(selectedLogDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    tasksDone: tasks.filter((t) => t.status === 'done'),
    tasksInProgress: tasks.filter((t) => t.status === 'in_progress'),
    reflectionNote: '',
  };

  const columns: { key: TaskItem['status']; label: string; badgeColor: string }[] = [
    { key: 'todo', label: 'To Do', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'in_progress', label: 'In Progress', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'done', label: 'Done', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>Kanban Board & Activity Log Harian</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola papan tugas Kanban dan simpan histori rekapan kegiatan harian per tanggal.</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'board' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-purple-600" />
            <span>Log Kegiatan Harian</span>
          </button>
        </div>
      </div>

      {/* 1. KANBAN BOARD VIEW */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          {/* Quick Task Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleCreateTask} className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <input
                type="text"
                placeholder="Tulis judul tugas baru & tekan Enter..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 w-full"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tugas</span>
              </button>
            </form>

            <button
              onClick={handleSnapshotDailyLog}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all"
            >
              <History className="w-4 h-4 text-purple-600" />
              <span>Simpan Snapshot Log Hari Ini</span>
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[550px] shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${col.badgeColor}`}>
                      {col.label} ({colTasks.length})
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {colTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-12">Belum ada tugas di kolom ini.</p>
                    ) : (
                      colTasks.map((t) => {
                        const isEditing = editingTaskId === t.id;
                        return (
                          <div
                            key={t.id}
                            className="p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl space-y-2 shadow-2xs transition-all group"
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-blue-600"
                                />
                                <textarea
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  placeholder="Deskripsi..."
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600 h-14"
                                />
                                <div className="flex justify-end gap-1 pt-1">
                                  <button
                                    onClick={() => setEditingTaskId(null)}
                                    className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-900"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(t.id)}
                                    className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                                  >
                                    Simpan
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{t.title}</h3>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleStartEdit(t)}
                                      className="p-1 text-slate-400 hover:text-blue-600"
                                      title="Edit Task"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(t.id)}
                                      className="p-1 text-slate-400 hover:text-red-600"
                                      title="Hapus Task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {t.description && (
                                  <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>
                                )}

                                {/* Move Status Controller */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px]">
                                  <span className="text-slate-400 uppercase font-semibold">Pindah ke:</span>
                                  <div className="flex gap-1">
                                    {col.key !== 'todo' && (
                                      <button
                                        onClick={() => handleMoveStatus(t.id, 'todo')}
                                        className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold hover:bg-amber-200"
                                      >
                                        To Do
                                      </button>
                                    )}
                                    {col.key !== 'in_progress' && (
                                      <button
                                        onClick={() => handleMoveStatus(t.id, 'in_progress')}
                                        className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold hover:bg-blue-200"
                                      >
                                        In Progress
                                      </button>
                                    )}
                                    {col.key !== 'done' && (
                                      <button
                                        onClick={() => handleMoveStatus(t.id, 'done')}
                                        className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-semibold hover:bg-emerald-200"
                                      >
                                        Done
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. LOG KEGIATAN HARIAN MENU */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Top Date Bar & Action Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Histori Log Kegiatan Harian</h2>
                <p className="text-xs text-slate-500">Log harian menyimpan rekapan tugas Kanban yang selesai dan dikerjakan per hari.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={selectedLogDate}
                onChange={(e) => setSelectedLogDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />

              <button
                onClick={handleSnapshotDailyLog}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Log Hari Ini</span>
              </button>

              <button
                onClick={() => handleCopyDailyReport(activeLog)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5 text-blue-600" />
                <span>{copySuccess ? 'Tersalin!' : 'Salin Laporan'}</span>
              </button>
            </div>
          </div>

          {/* Daily Performance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tugas Selesai ({activeLog.dateFormatted})</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{activeLog.tasksDone.length} Selesai</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sedang Dikerjakan</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">{activeLog.tasksInProgress.length} In Progress</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Produktivitas Output</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {activeLog.tasksDone.length + activeLog.tasksInProgress.length > 0
                  ? `${Math.round((activeLog.tasksDone.length / (activeLog.tasksDone.length + activeLog.tasksInProgress.length)) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>

          {/* Log Detail Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Rincian Kegiatan Log — {activeLog.dateFormatted}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Completed Tasks List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Daftar Tugas Selesai ({activeLog.tasksDone.length})</span>
                </h4>

                <div className="space-y-2">
                  {activeLog.tasksDone.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      Belum ada tugas selesai pada tanggal ini.
                    </p>
                  ) : (
                    activeLog.tasksDone.map((t, idx) => (
                      <div key={t.id || idx} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{idx + 1}. {t.title}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">DONE</span>
                        </div>
                        {t.description && <p className="text-[11px] text-slate-600">{t.description}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* In Progress Tasks List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Tugas Sedang Dikerjakan ({activeLog.tasksInProgress.length})</span>
                </h4>

                <div className="space-y-2">
                  {activeLog.tasksInProgress.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      Tidak ada tugas aktif di tahap In Progress pada tanggal ini.
                    </p>
                  ) : (
                    activeLog.tasksInProgress.map((t, idx) => (
                      <div key={t.id || idx} className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{idx + 1}. {t.title}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">IN PROGRESS</span>
                        </div>
                        {t.description && <p className="text-[11px] text-slate-600">{t.description}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Daily Reflection Note */}
            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-2 text-xs">
              <label className="font-bold text-purple-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Catatan & Refleksi Harian ({activeLog.dateFormatted})</span>
              </label>
              <textarea
                value={activeLog.reflectionNote}
                onChange={(e) => handleSaveReflection(activeLog.date, e.target.value)}
                placeholder="Tuliskan catatan evaluasi, hambatan, atau progres penting hari ini..."
                className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600 h-24"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
