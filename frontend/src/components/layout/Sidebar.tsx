'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/useUIStore';
import {
  Home, FileText, CheckSquare, Calendar, Music, Workflow, AlertTriangle,
  FileCode, KeyRound, FileImage, Settings, ChevronDown, ChevronRight,
  Presentation, Gamepad2, Crown, FileType, TrendingUp, History, Scissors
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useUIStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Presentation': true,
    'Visual Studio': true,
    'IT Workspace': true,
    'Games & Arcade': true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { label: 'Home', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
        { label: 'My Notes', href: '/notes', icon: <FileText className="w-4 h-4" /> },
        { label: 'Kanban Tasks', href: '/tasks', icon: <CheckSquare className="w-4 h-4" /> },
        { label: 'Log Kegiatan Harian', href: '/logs', icon: <History className="w-4 h-4 text-purple-600" /> },
        { label: 'Calendar', href: '/calendar', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Problem Tracker', href: '/problems', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
        { label: 'Stock Market', href: '/stocks', icon: <TrendingUp className="w-4 h-4 text-emerald-600" /> },
      ],
    },
    {
      title: 'Presentation',
      items: [
        { label: 'Slide Studio', href: '/presentation', icon: <Presentation className="w-4 h-4 text-blue-600" /> },
      ],
    },
    {
      title: 'IT Workspace',
      items: [
        { label: 'Remove Background', href: '/it-workspace/bg-remover', icon: <Scissors className="w-4 h-4 text-rose-500" /> },
        { label: 'JSON Formatter', href: '/it-workspace/json-formatter', icon: <FileCode className="w-4 h-4 text-blue-600" /> },
        { label: 'UUID Generator', href: '/it-workspace/uuid-generator', icon: <KeyRound className="w-4 h-4 text-blue-600" /> },
        { label: 'JPG to PDF', href: '/it-workspace/file-converter/jpg-to-pdf', icon: <FileImage className="w-4 h-4 text-blue-600" /> },
        { label: 'Merge PDF', href: '/it-workspace/file-converter/merge-pdf', icon: <FileType className="w-4 h-4 text-blue-600" /> },
      ],
    },
    {
      title: 'Games & Arcade',
      items: [
        { label: 'Chess (Catur)', href: '/games/chess', icon: <Crown className="w-4 h-4 text-amber-500" /> },
        { label: 'Tic Tac Toe', href: '/games/tictactoe', icon: <Gamepad2 className="w-4 h-4 text-indigo-600" /> },
      ],
    },
    {
      title: 'Music Studio',
      items: [
        { label: 'Audio Player', href: '/music', icon: <Music className="w-4 h-4 text-indigo-600" /> },
      ],
    },
  ];

  if (pathname === '/login' || pathname === '/register') return null;

  if (isSidebarCollapsed) {
    return (
      <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-6 transition-all duration-300">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
          NX
        </div>
        <nav className="flex flex-col gap-2">
          {navSections.flatMap((s) => s.items).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2.5 rounded-xl transition-colors ${
                pathname === item.href ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={item.label}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">
          NX
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">NEXUS WORKSPACE</h1>
          <p className="text-[10px] text-slate-500 mt-0.5">One Workspace. Infinite Possibilities.</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 pb-20">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {section.title !== 'Main' ? (
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors"
              >
                <span>{section.title}</span>
                {openSections[section.title] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : (
              <p className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </p>
            )}

            {(section.title === 'Main' || openSections[section.title]) && (
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};
