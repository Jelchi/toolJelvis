'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-client';
import {
  AlertTriangle, Plus, Search, Calendar, Bell, CheckCircle2, Upload,
  Trash2, Edit3, Eye, CheckSquare, Tag, FileText, X, Lightbulb, Clock, Check,
  ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2
} from 'lucide-react';

interface ProblemTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  solution?: string;
  opened_date: string;
  resolved_date?: string;
  reminder_at?: string;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemTicket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_problem_tickets');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [
      {
        id: '1',
        ticket_number: 'TKT-1001',
        title: 'Database connection latency spike under heavy load',
        description: 'PostgreSQL connection pool maxed out during peak API traffic.',
        category: 'Database & Infrastructure',
        image_url: JSON.stringify([
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'
        ]),
        status: 'in_progress',
        priority: 'high',
        solution: '',
        opened_date: '2026-09-18T10:00:00Z',
        reminder_at: '2026-09-19T14:00:00Z',
      },
      {
        id: '2',
        ticket_number: 'TKT-1002',
        title: 'Frontend Tiptap editor autosave debounce delay',
        description: 'Autosave indicator sometimes triggers twice on fast key presses.',
        category: 'Frontend & UI',
        image_url: JSON.stringify([
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
        ]),
        status: 'resolved',
        priority: 'medium',
        solution: 'Diubah nilai debounce dari 300ms ke 800ms dan ditambahkan klausa guard flag cancel pada unmount component.',
        opened_date: '2026-09-17T09:30:00Z',
        resolved_date: '2026-09-18T16:00:00Z',
      },
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<ProblemTicket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<ProblemTicket | null>(null);
  const [solvingTicket, setSolvingTicket] = useState<ProblemTicket | null>(null);

  // Form states for Create Modal
  const [ticketNumber, setTicketNumber] = useState(`TKT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Backend & API');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [priority, setPriority] = useState<ProblemTicket['priority']>('medium');
  const [reminderAt, setReminderAt] = useState('');
  const [solutionText, setSolutionText] = useState('');

  // Gallery viewer state in View Ticket Modal
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  // Helper to extract image array from ticket.image_url
  const getTicketImages = (ticket: ProblemTicket): string[] => {
    if (!ticket.image_url) return [];
    const raw = ticket.image_url.trim();
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {}
    }
    return [raw];
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('nexus_problem_tickets', JSON.stringify(problems));
  }, [problems]);

  const fetchProblems = async () => {
    try {
      const data = await apiRequest<ProblemTicket[]>('/problems');
      if (Array.isArray(data) && data.length > 0) {
        setProblems(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Multi-file upload handler
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const readPromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then((newBase64Images) => {
        if (isEdit && editingTicket) {
          const existing = getTicketImages(editingTicket);
          const updated = [...existing, ...newBase64Images];
          setEditingTicket({
            ...editingTicket,
            image_url: JSON.stringify(updated),
          });
        } else {
          setImageUrls((prev) => [...prev, ...newBase64Images]);
        }
      });
    }
  };

  const handleRemoveCreateImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveEditImage = (index: number) => {
    if (!editingTicket) return;
    const existing = getTicketImages(editingTicket);
    const updated = existing.filter((_, i) => i !== index);
    setEditingTicket({
      ...editingTicket,
      image_url: updated.length > 0 ? JSON.stringify(updated) : '',
    });
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalImageUrl = imageUrls.length > 0 ? JSON.stringify(imageUrls) : '';

    const payload = {
      ticket_number: ticketNumber,
      title,
      description,
      category,
      image_url: finalImageUrl,
      status: 'open',
      priority,
      solution: '',
      opened_date: new Date().toISOString(),
      reminder_at: reminderAt ? new Date(reminderAt).toISOString() : undefined,
    };

    try {
      const created = await apiRequest<ProblemTicket>('/problems', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setProblems([created, ...problems]);
    } catch (err) {
      const localTicket: ProblemTicket = {
        id: Date.now().toString(),
        ...payload,
        status: 'open',
        priority,
      };
      setProblems([localTicket, ...problems]);
    }

    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setImageUrls([]);
    setCategory('Backend & API');
    setTicketNumber(`TKT-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSaveEditTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket || !editingTicket.title.trim()) return;

    setProblems((prev) =>
      prev.map((p) => (p.id === editingTicket.id ? editingTicket : p))
    );

    try {
      await apiRequest(`/problems/${editingTicket.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingTicket),
      });
    } catch (err) {}

    setEditingTicket(null);
  };

  const handleSaveSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingTicket || !solutionText.trim()) return;

    const nowIso = new Date().toISOString();
    const updatedTicket: ProblemTicket = {
      ...solvingTicket,
      status: 'resolved',
      solution: solutionText.trim(),
      resolved_date: nowIso,
    };

    setProblems((prev) =>
      prev.map((p) => (p.id === solvingTicket.id ? updatedTicket : p))
    );

    try {
      await apiRequest(`/problems/${solvingTicket.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'resolved',
          solution: solutionText.trim(),
          resolved_date: nowIso,
        }),
      });
    } catch (err) {}

    setSolvingTicket(null);
    setSolutionText('');
  };

  const handleUpdateStatus = async (id: string, newStatus: ProblemTicket['status']) => {
    const target = problems.find((p) => p.id === id);
    if (!target) return;

    if (newStatus === 'resolved' && !target.solution) {
      setSolvingTicket(target);
      setSolutionText(target.solution || '');
      return;
    }

    const isResolved = newStatus === 'resolved' || newStatus === 'closed';
    const nowIso = new Date().toISOString();

    setProblems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: newStatus, resolved_date: isResolved ? (p.resolved_date || nowIso) : p.resolved_date } : p
      )
    );

    try {
      await apiRequest(`/problems/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          resolved_date: isResolved ? nowIso : undefined,
        }),
      });
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket masalah ini?')) return;
    setProblems((prev) => prev.filter((p) => p.id !== id));
    try {
      await apiRequest(`/problems/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  const categories = ['all', ...Array.from(new Set(problems.map((p) => p.category || 'General')))];

  const filteredProblems = problems.filter((p) => {
    const matchesQuery =
      p.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.solution?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' ? true : (p.category || 'General') === categoryFilter;
    return matchesQuery && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: ProblemTicket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved':
      case 'closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <span>Problem Management & Issue Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporkan tiket masalah, upload banyak screenshot bukti, edit data, pantau status, dan catat solusi penanganan secara persisten.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            setImageUrls([]);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tiket Problem Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor tiket, judul masalah, atau teks solusi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'all' ? 'Semua Kategori' : cat}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Cards List */}
      <div className="space-y-4">
        {filteredProblems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
            Tidak ada tiket masalah ditemukan. Klik &quot;Buat Tiket Problem Baru&quot; untuk melaporkan isu baru.
          </div>
        ) : (
          filteredProblems.map((ticket) => {
            const ticketImages = getTicketImages(ticket);
            return (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row gap-5"
              >
                {/* Image Screenshot Multi-Gallery Preview Box */}
                {ticketImages.length > 0 && (
                  <div
                    onClick={() => {
                      setViewingTicket(ticket);
                      setActiveGalleryIndex(0);
                    }}
                    className="w-full md:w-48 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 relative cursor-pointer group"
                  >
                    <img
                      src={ticketImages[0]}
                      alt={ticket.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90 group-hover:opacity-100"
                    />

                    {/* Multi-Photo Count Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <ImageIcon className="w-3 h-3 text-blue-400" />
                      <span>{ticketImages.length} Foto</span>
                    </div>

                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {/* Ticket Details */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-700 rounded-md">
                          {ticket.ticket_number}
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getStatusBadge(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-full uppercase">
                          {ticket.priority}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-semibold rounded-md flex items-center gap-1">
                          <Tag className="w-3 h-3 text-blue-600" />
                          <span>{ticket.category || 'General'}</span>
                        </span>
                      </div>

                      <h3
                        onClick={() => {
                          setViewingTicket(ticket);
                          setActiveGalleryIndex(0);
                        }}
                        className="text-sm font-bold text-slate-900 mt-1.5 hover:text-blue-600 cursor-pointer"
                      >
                        {ticket.title}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setViewingTicket(ticket);
                          setActiveGalleryIndex(0);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Lihat Detail & Gallery Foto Tiket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingTicket(ticket)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Edit Tiket Problem"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Hapus Tiket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{ticket.description}</p>

                  {/* Solution Summary Box */}
                  {ticket.solution && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <Lightbulb className="w-4 h-4" />
                        <span>Solusi & Penanganan Poin Masalah:</span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-medium pl-5 whitespace-pre-wrap">{ticket.solution}</p>
                    </div>
                  )}

                  {/* Dates & Reminder Info */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dibuka: {new Date(ticket.opened_date).toLocaleDateString()}</span>
                    </span>

                    {ticket.resolved_date && (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai: {new Date(ticket.resolved_date).toLocaleDateString()}</span>
                      </span>
                    )}

                    {ticket.reminder_at && (
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                        <Bell className="w-3 h-3 text-amber-600" />
                        <span>Reminder Target: {new Date(ticket.reminder_at).toLocaleString()}</span>
                      </span>
                    )}
                  </div>

                  {/* Status Controller */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {ticket.status !== 'in_progress' && (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                        className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Mulai Kerjakan
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSolvingTicket(ticket);
                        setSolutionText(ticket.solution || '');
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-colors flex items-center gap-1"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{ticket.status === 'resolved' ? 'Edit Solusi' : 'Tulis Solusi & Selesaikan'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: CREATE PROBLEM TICKET WITH MULTI-PHOTO UPLOAD */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Buat Tiket Problem Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nomor Tiket (Auto Generator)</label>
                <input
                  type="text"
                  readOnly
                  value={ticketNumber}
                  className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Masalah / Ringkasan Issue</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ringkas titik permasalahan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kategori System</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Backend & API">Backend & API</option>
                    <option value="Frontend & UI">Frontend & UI</option>
                    <option value="Database & Infrastructure">Database & Infrastructure</option>
                    <option value="Network & Connectivity">Network & Connectivity</option>
                    <option value="Security & Auth">Security & Auth</option>
                    <option value="Hardware & Server">Hardware & Server</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tingkat Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="low">Low (Rendah)</option>
                    <option value="medium">Medium (Sedang)</option>
                    <option value="high">High (Tinggi)</option>
                    <option value="critical">Critical (Kritis)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Deskripsi Detail Masalah & Langkah Reproduksi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan pesan error, alur kejadian, atau screenshot log..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 h-20"
                />
              </div>

              {/* Multi-Photo Upload Section */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Upload Foto Bukti (Bisa Pilih Banyak Foto Sekaligus)</span>
                  <span className="text-blue-600 font-bold">{imageUrls.length} Foto Terpilih</span>
                </label>

                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-3 text-center bg-slate-50 relative cursor-pointer transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleMultipleImageUpload(e, false)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800">Klik untuk upload 1 atau lebih foto dari perangkat</p>
                  <p className="text-[10px] text-slate-400">Pilih beberapa file foto bersamaan (PNG, JPG, WEBP)</p>
                </div>

                {/* Uploaded Multi-Image Thumbnails Grid */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {imageUrls.map((img, idx) => (
                      <div key={idx} className="relative aspect-square border border-slate-200 rounded-xl overflow-hidden bg-slate-100 group">
                        <img src={img} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveCreateImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 group-hover:opacity-100 transition-opacity shadow-xs"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Set Tanggal Reminder (Optional)</label>
                <input
                  type="datetime-local"
                  value={reminderAt}
                  onChange={(e) => setReminderAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW TICKET DETAILS & MULTI-PHOTO GALLERY LIGHTBOX */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-800 rounded-lg">
                  {viewingTicket.ticket_number}
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusBadge(viewingTicket.status)}`}>
                  {viewingTicket.status.replace('_', ' ')}
                </span>
              </div>
              <button onClick={() => setViewingTicket(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{viewingTicket.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Kategori: <strong className="text-slate-800">{viewingTicket.category || 'General'}</strong></span>
                  <span>•</span>
                  <span>Prioritas: <strong className="text-red-600 uppercase">{viewingTicket.priority}</strong></span>
                </div>
              </div>

              {/* Multi-Photo Interactive Gallery Slider & Lightbox */}
              {(() => {
                const images = getTicketImages(viewingTicket);
                if (images.length === 0) return null;

                const activeImg = images[activeGalleryIndex] || images[0];

                return (
                  <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                        <span>Gallery Foto Bukti Problem ({images.length} Foto)</span>
                      </span>
                      <span>Foto {activeGalleryIndex + 1} dari {images.length}</span>
                    </div>

                    {/* Main Active Photo View with Left/Right Controls */}
                    <div className="relative h-80 rounded-xl overflow-hidden bg-black flex items-center justify-center group">
                      <img
                        src={activeImg}
                        alt={`Photo ${activeGalleryIndex + 1}`}
                        className="max-h-80 max-w-full object-contain"
                      />

                      {/* Previous Photo Button */}
                      {images.length > 1 && (
                        <button
                          onClick={() => setActiveGalleryIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                          className="absolute left-2 p-2 bg-slate-900/80 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
                          title="Foto Sebelumnya"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}

                      {/* Next Photo Button */}
                      {images.length > 1 && (
                        <button
                          onClick={() => setActiveGalleryIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 p-2 bg-slate-900/80 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
                          title="Foto Berikutnya"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Thumbnail Selector Strip */}
                    {images.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pt-2">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveGalleryIndex(idx)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                              activeGalleryIndex === idx ? 'border-blue-500 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-800">Deskripsi Masalah:</span>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{viewingTicket.description}</p>
              </div>

              {/* Solution Section */}
              {viewingTicket.solution ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <Lightbulb className="w-4 h-4" />
                    <span>Solusi & Penanganan:</span>
                  </div>
                  <p className="text-slate-700 font-medium whitespace-pre-wrap">{viewingTicket.solution}</p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                  <span>Belum ada solusi tertulis untuk tiket ini.</span>
                  <button
                    onClick={() => {
                      setSolvingTicket(viewingTicket);
                      setViewingTicket(null);
                    }}
                    className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold"
                  >
                    + Tulis Solusi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TICKET WITH MULTI-PHOTO EDITING */}
      {editingTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Tiket Problem</h3>
              <button onClick={() => setEditingTicket(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTicket} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Masalah</label>
                <input
                  type="text"
                  required
                  value={editingTicket.title}
                  onChange={(e) => setEditingTicket({ ...editingTicket, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kategori</label>
                  <select
                    value={editingTicket.category || 'General'}
                    onChange={(e) => setEditingTicket({ ...editingTicket, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Backend & API">Backend & API</option>
                    <option value="Frontend & UI">Frontend & UI</option>
                    <option value="Database & Infrastructure">Database & Infrastructure</option>
                    <option value="Network & Connectivity">Network & Connectivity</option>
                    <option value="Security & Auth">Security & Auth</option>
                    <option value="Hardware & Server">Hardware & Server</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Prioritas</label>
                  <select
                    value={editingTicket.priority}
                    onChange={(e) => setEditingTicket({ ...editingTicket, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Deskripsi</label>
                <textarea
                  value={editingTicket.description}
                  onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 h-20"
                />
              </div>

              {/* Edit Multi-Photo Gallery List & Upload Additional */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Kelola Foto Bukti</span>
                  <span className="text-blue-600 font-bold">{getTicketImages(editingTicket).length} Foto</span>
                </label>

                {/* Attached Images Grid */}
                {getTicketImages(editingTicket).length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {getTicketImages(editingTicket).map((img, idx) => (
                      <div key={idx} className="relative aspect-square border border-slate-200 rounded-xl overflow-hidden bg-slate-100 group">
                        <img src={img} alt={`Edit Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 group-hover:opacity-100 transition-opacity shadow-xs"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-2.5 text-center bg-slate-50 relative cursor-pointer transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleMultipleImageUpload(e, true)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600">
                    <Plus className="w-4 h-4" />
                    <span>Tambah Foto Bukti Baru</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Solusi & Penanganan</label>
                <textarea
                  value={editingTicket.solution || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, solution: e.target.value })}
                  placeholder="Tulis solusi penanganan apabila sudah selesai..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: WRITE SOLUTION ON RESOLVE */}
      {solvingTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Lightbulb className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Tulis Solusi & Selesaikan Tiket</h3>
            </div>

            <p className="text-xs text-slate-500">
              Tiket <strong className="text-slate-800">{solvingTicket.ticket_number}</strong> akan ditandai sebagai <span className="font-bold text-emerald-600 uppercase">Resolved</span>. Tuliskan rincian langkah solusi penanganannya di bawah ini.
            </p>

            <form onSubmit={handleSaveSolution} className="space-y-3 text-xs">
              <textarea
                required
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Contoh: Menambahkan indeks komposit pada kolom user_id dan status di database SQLite/PostgreSQL untuk mempercepat query..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 h-32"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSolvingTicket(null)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Simpan & Tandai Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
