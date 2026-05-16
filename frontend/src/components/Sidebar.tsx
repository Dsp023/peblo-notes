"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { FileText, LayoutDashboard, LogOut, Loader2, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const navItems = [
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  if (loading) {
    return (
      <aside className="w-64 bg-zinc-50 dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800/50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400 dark:text-zinc-500" />
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-zinc-50 dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800/50 h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/notes" className="flex items-center gap-3 group">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Peblo Notes</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-[16px] h-[16px] ${isActive ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info and Theme Toggle */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/50 mt-auto">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate">{user?.name}</p>
          <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
        </div>
        
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="w-[16px] h-[16px]" /> : <Moon className="w-[16px] h-[16px]" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all duration-200 mt-1"
        >
          <LogOut className="w-[16px] h-[16px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
