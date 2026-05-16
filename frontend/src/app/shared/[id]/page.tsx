"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, FileText, Calendar, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

interface SharedNote {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  updatedAt: string;
  user: { name: string };
  tags: { id: string; name: string }[];
  summary?: string | null;
}

export default function SharedNotePage() {
  const params = useParams();
  const id = params.id as string;
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const res = await api.get(`/shared/${id}`);
      setNote(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'This note is not available.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 dark:text-zinc-500" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#09090b] px-4">
        <div className="w-16 h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center mb-5">
          <FileText className="w-6 h-6 text-zinc-300 dark:text-zinc-500" />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Note Unavailable</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs text-center">{error || 'This note does not exist or is private.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 py-4 px-6 sticky top-0 z-10 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Peblo Notes</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto py-16 px-6 animate-fade-in">
        <article>
          {/* Article header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight leading-tight">
              {note.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4" />
                <span>{note.user.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(note.updatedAt), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            {note.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <span key={tag.id} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded text-xs font-medium">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Summary if exists */}
          {note.summary && (
            <div className="mb-12">
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  AI Summary
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{note.summary}</p>
              </div>
            </div>
          )}

          {/* Article body */}
          <div className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-300 text-base leading-[1.8] font-serif">
            {note.content}
          </div>
        </article>

        <div className="mt-24 pt-8 border-t border-zinc-200 dark:border-zinc-800/50 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            Powered by Peblo AI Notes
          </p>
        </div>
      </main>
    </div>
  );
}
