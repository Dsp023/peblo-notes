"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import {
  Search, Plus, Tag, Trash2, Save, Sparkles,
  Globe, Lock, Loader2, FileText, Copy, Check
} from 'lucide-react';
import { format } from 'date-fns';

interface NoteTag {
  id: string;
  name: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  tags: NoteTag[];
  summary?: string | null;
  actionItems?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editor state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Auto-save timer
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setTagInput(activeNote.tags.map(t => t.name).join(', '));
      setIsPublic(activeNote.isPublic);
    } else {
      setTitle('');
      setContent('');
      setTagInput('');
      setIsPublic(false);
    }
  }, [activeNote]);

  // Auto-save: debounce 2s after typing
  useEffect(() => {
    if (!activeNote) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave(true);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, tagInput, isPublic]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notes');
      setNotes(res.data);
      if (res.data.length > 0) {
        setActiveNote(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await api.post('/notes', {
        title: 'Untitled Note',
        content: '',
        tags: [],
        isPublic: false
      });
      setNotes(prev => [res.data, ...prev]);
      setActiveNote(res.data);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const handleSave = async (silent = false) => {
    if (!activeNote) return;
    try {
      if (!silent) setSaving(true);
      const tagsArray = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.put(`/notes/${activeNote.id}`, {
        title: title || 'Untitled Note',
        content,
        tags: tagsArray,
        isPublic
      });
      setNotes(prev => prev.map(n => n.id === activeNote.id ? res.data : n));
      setActiveNote(res.data);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/notes/${id}`);
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      if (activeNote?.id === id) {
        setActiveNote(updated[0] || null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleGenerateAI = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    try {
      setAiLoading(true);
      // Save first to ensure latest content is on server
      await handleSave(true);
      const res = await api.post(`/notes/${activeNote.id}/ai/process`);
      setNotes(prev => prev.map(n => n.id === activeNote.id ? res.data : n));
      setActiveNote(res.data);
    } catch (err) {
      console.error('Failed to generate AI insights:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(`${window.location.origin}/shared/${activeNote.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Collect unique tags for filter
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags.map(t => t.name))));

  const filteredNotes = notes.filter(n => {
    const matchesSearch = searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = filterTag === '' || n.tags.some(t => t.name === filterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#09090b]">
      {/* ────── Left: Notes List ────── */}
      <div className="w-72 bg-zinc-50 dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800/50 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">My Notes</h2>
            <button
              id="create-note-btn"
              onClick={handleCreate}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="New Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              id="search-notes"
              type="text"
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tag filter chips */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterTag('')}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterTag === '' 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900' 
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                All
              </button>
              {allTags.slice(0, 6).map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterTag === tag 
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900' 
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400 dark:text-zinc-500" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileText className="w-8 h-8 text-zinc-200 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No notes found</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => setActiveNote(note)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                  activeNote?.id === note.id
                    ? 'bg-white dark:bg-zinc-800/80 shadow-sm border border-zinc-200 dark:border-transparent'
                    : 'hover:bg-white/60 dark:hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-medium truncate pr-2 ${activeNote?.id === note.id ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {note.title}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2 line-clamp-2 leading-relaxed">
                  {note.content || 'Empty note...'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag.id} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded font-medium">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {format(new Date(note.updatedAt), 'MMM d')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ────── Middle: Note Editor ────── */}
      {activeNote ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#09090b] animate-fade-in relative">
          {/* Toolbar */}
          <div className="px-8 py-5 flex justify-between items-center z-10 border-b border-zinc-100 dark:border-transparent">
            <input
              id="note-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none bg-transparent placeholder-zinc-200 dark:placeholder-zinc-700 flex-1 mr-4 tracking-tight"
              placeholder="Note Title"
            />
            <div className="flex items-center gap-2 shrink-0">
              {/* Public toggle */}
              <button
                id="toggle-public"
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isPublic 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700' 
                    : 'bg-transparent text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {isPublic ? 'Public' : 'Private'}
              </button>

              {/* Share link */}
              {isPublic && (
                <button
                  id="copy-share-link"
                  onClick={handleCopyShareLink}
                  className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Copy share link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}

              {/* Save state indicator */}
              <div className="flex items-center text-xs text-zinc-400 dark:text-zinc-500 ml-2 min-w-[60px] justify-end">
                {saving ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Saved</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-12 pt-4">
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing..."
              className="w-full h-full min-h-[500px] resize-none focus:outline-none text-zinc-800 dark:text-zinc-300 text-[15px] leading-relaxed bg-transparent font-serif"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#09090b]">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-zinc-300 dark:text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            Select a note or create a new one.
          </p>
          <button onClick={handleCreate} className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" /> Create Note
          </button>
        </div>
      )}

      {/* ────── Right: AI & Meta Panel ────── */}
      {activeNote && (
        <div className="w-80 bg-zinc-50 dark:bg-[#09090b] border-l border-zinc-200 dark:border-zinc-800/50 flex flex-col shrink-0 animate-fade-in">
          {/* Tags section */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/50">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </label>
            <input
              id="tags-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. meeting, ideas"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* AI Insights */}
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">AI Insights</h3>
            </div>

            <button
              id="generate-ai-btn"
              onClick={handleGenerateAI}
              disabled={aiLoading || !content.trim()}
              className="w-full mb-6 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Insights
                </>
              )}
            </button>

            {activeNote.summary && (
              <div className="mb-6 animate-slide-up">
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Summary</h4>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 leading-relaxed shadow-sm">
                  {activeNote.summary}
                </div>
              </div>
            )}

            {activeNote.actionItems && (
              <div className="animate-slide-up">
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Action Items</h4>
                <ul className="space-y-2">
                  {(() => {
                    try {
                      const items = JSON.parse(activeNote.actionItems);
                      return Array.isArray(items) ? items.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 mt-1.5 shrink-0"></div>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      )) : null;
                    } catch {
                      return <li className="text-sm text-zinc-500">{activeNote.actionItems}</li>;
                    }
                  })()}
                </ul>
              </div>
            )}

            {!activeNote.summary && !activeNote.actionItems && (
              <div className="text-center py-8">
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                  Write content to generate<br />AI summaries and action items.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
