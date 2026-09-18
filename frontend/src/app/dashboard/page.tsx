'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, CheckSquare, Calendar, Workflow, KeyRound, ArrowRight, Plus, Scissors } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            NEXUS WORKSPACE
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
            Welcome back, {user?.full_name || 'Jelvis'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Minimalist All-in-One Digital Workspace. Organize your notes, tasks, calendar, and developer tools.
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            href="/notes"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>New Note</span>
          </Link>
          <Link
            href="/tasks"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/notes" className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">My Notes</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Tiptap editor & markdown</p>
        </Link>

        <Link href="/tasks" className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Kanban Board</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Task workflow management</p>
        </Link>

        <Link href="/calendar" className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Calendar</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Event schedule & deadlines</p>
        </Link>

        <Link href="/it-workspace/bg-remover" className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-rose-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Remove Background</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">AI & Canvas Image Studio</p>
        </Link>
      </div>

      {/* Main Section: Recent Notes & Kanban Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Notes Documentation</span>
            </h2>
            <Link href="/notes" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              <span>Open Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
              <h3 className="text-xs font-bold text-slate-900">System Architecture Overview</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                FastAPI backend clean layered architecture with Next.js frontend integration.
              </p>
            </div>
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>Kanban Tasks</span>
            </h2>
            <Link href="/tasks" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              <span>Open Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                <span className="text-xs font-medium text-slate-700">Setup Monorepo & FastAPI Auth</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">DONE</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <input type="checkbox" className="rounded text-blue-600" />
                <span className="text-xs font-medium text-slate-900">Editable Kanban Task Board</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">IN PROGRESS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
