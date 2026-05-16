"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, FileText, Clock, Sparkles, TrendingUp, Tag, BarChart3 } from 'lucide-react';

interface DashboardInsights {
  totalNotes: number;
  recentlyEdited: number;
  mostUsedTags: { name: string; count: number }[];
  aiUsageCount: number;
}

export default function DashboardPage() {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await api.get('/dashboard/insights');
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 dark:text-zinc-500" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <p className="text-zinc-500 text-sm">Failed to load insights.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Notes',
      value: insights.totalNotes,
      icon: FileText,
    },
    {
      label: 'Edited (7 days)',
      value: insights.recentlyEdited,
      icon: Clock,
    },
    {
      label: 'AI Summaries',
      value: insights.aiUsageCount,
      icon: Sparkles,
    },
    {
      label: 'Top Tag',
      value: insights.mostUsedTags[0]?.name || '—',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in h-full overflow-y-auto bg-white dark:bg-[#09090b]">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Overview of your workspace activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card p-5 animate-slide-up bg-white dark:bg-zinc-900/50" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
                <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              </div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tag chart */}
        <div className="card p-6 lg:col-span-2 bg-white dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Top Tags</h2>
          </div>

          {insights.mostUsedTags.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-6 h-6 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No tags used yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.mostUsedTags.map((tag, i) => {
                const maxCount = insights.mostUsedTags[0].count;
                const pct = Math.max((tag.count / maxCount) * 100, 5);
                return (
                  <div key={tag.name} className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-24 text-sm font-medium text-zinc-600 dark:text-zinc-400 truncate shrink-0">{tag.name}</div>
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded h-6 overflow-hidden">
                      <div
                        className="h-full bg-zinc-800 dark:bg-zinc-200 rounded flex items-center px-2 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      >
                        <span className="text-[10px] font-bold text-zinc-100 dark:text-zinc-900">{tag.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly activity hint */}
        <div className="card p-6 bg-white dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Activity</h2>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const activity = i < insights.recentlyEdited 
                ? 'bg-zinc-400 dark:bg-zinc-400' 
                : 'bg-zinc-100 dark:bg-zinc-800';
              return (
                <div key={i} className="text-center">
                  <div className={`w-full aspect-square rounded-sm ${activity} transition-colors mb-1.5`}></div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
