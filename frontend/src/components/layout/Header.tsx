'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Menu, Search, Bell, ChevronDown, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  if (pathname === '/login' || pathname === '/register') return null;

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_workspace_id');
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40 sticky top-0 shadow-xs">
      {/* Left: Sidebar Toggle & Workspace */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">Jelvis Workspace</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Middle: Search Bar Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <div className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 shadow-xs">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search notes, tasks, diagrams...</span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: User Menu & Logout */}
      <div className="flex items-center gap-3">
        <button className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {user?.full_name ? user.full_name[0] : 'J'}
          </div>
          <span className="text-xs font-medium text-slate-800 hidden sm:inline-block">
            {user?.full_name || 'Jelvis'}
          </span>
          <button
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
