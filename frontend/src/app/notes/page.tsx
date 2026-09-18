'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  FileText, Plus, Search, Star, Trash2, Tag, Bold, Italic, List, ListOrdered, Code, Heading1, Heading2, Check, RefreshCw
} from 'lucide-react';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  is_deleted: boolean;
  tags: string[];
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      title: 'NEXUS Architecture Overview',
      content: '<h2>System Architecture</h2><p>Modular Next.js frontend coupled with Python FastAPI backend.</p>',
      is_favorite: true,
      is_deleted: false,
      tags: ['architecture', 'fastapi'],
      updated_at: new Date().toISOString()
    },
    {
      id: 'note-2',
      title: 'Sprint Backlog & Feature Checklist',
      content: '<ul><li>Rich Text Tiptap Editor</li><li>Flowchart React Flow Engine</li><li>UUID Generator</li></ul>',
      is_favorite: false,
      is_deleted: false,
      tags: ['sprint', 'todo'],
      updated_at: new Date().toISOString()
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string>('note-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [tagInput, setTagInput] = useState<string>('');

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your thoughts, documentation, or notes here...',
      }),
    ],
    content: activeNote ? activeNote.content : '',
    onUpdate: ({ editor }) => {
      setSaveStatus('saving');
      const updatedContent = editor.getHTML();
      
      // Debounce autosave effect
      const timer = setTimeout(() => {
        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.id === activeNoteId ? { ...n, content: updatedContent, updated_at: new Date().toISOString() } : n
          )
        );
        setSaveStatus('saved');
      }, 800);

      return () => clearTimeout(timer);
    },
  });

  // Sync editor when active note changes
  useEffect(() => {
    if (editor && activeNote) {
      if (editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content);
      }
    }
  }, [activeNoteId, editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setSaveStatus('saving');
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === activeNoteId ? { ...n, title: newTitle } : n))
    );
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '<p></p>',
      is_favorite: false,
      is_deleted: false,
      tags: ['personal'],
      updated_at: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleToggleFavorite = (id: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === id ? { ...n, is_favorite: !n.is_favorite } : n))
    );
  };

  const handleSoftDelete = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== id));
    if (activeNoteId === id && notes.length > 1) {
      setActiveNoteId(notes.find((n) => n.id !== id)?.id || '');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && activeNote) {
      const newTag = tagInput.trim().toLowerCase();
      if (!activeNote.tags.includes(newTag)) {
        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.id === activeNoteId ? { ...n, tags: [...n.tags, newTag] } : n
          )
        );
      }
      setTagInput('');
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = filterFavorite ? n.is_favorite : true;
    return matchesSearch && matchesFavorite && !n.is_deleted;
  });

  return (
    <div className="h-[calc(100vh-6.5rem)] flex border border-border rounded-xl bg-surface overflow-hidden shadow-md">
      {/* Sidebar List of Notes */}
      <div className="w-80 border-r border-border flex flex-col bg-background/50">
        {/* Search & Actions Bar */}
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primaryText flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-500" />
              <span>My Notes</span>
            </h2>
            <button
              onClick={handleCreateNote}
              className="p-1.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-all text-xs font-semibold flex items-center gap-1 shadow-sm"
              title="New Note"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-secondaryText absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-primaryText focus:outline-none focus:border-accent-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setFilterFavorite(!filterFavorite)}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                filterFavorite
                  ? 'bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/30'
                  : 'text-secondaryText hover:bg-border/50'
              }`}
            >
              <Star className="w-3 h-3" />
              <span>Favorites</span>
            </button>
          </div>
        </div>

        {/* Note List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center text-secondaryText text-xs">No notes found.</div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-3 cursor-pointer transition-all ${
                  activeNoteId === note.id ? 'bg-accent-500/10 border-l-4 border-accent-500' : 'hover:bg-surface/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-primaryText truncate">{note.title || 'Untitled Note'}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(note.id);
                    }}
                    className="text-secondaryText hover:text-amber-400"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        note.is_favorite ? 'text-amber-400 fill-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-secondaryText line-clamp-1 mt-1">
                  {note.content.replace(/<[^>]*>?/gm, '') || 'Empty note content...'}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {note.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-border/50 text-[9px] text-secondaryText rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Tiptap Rich Text Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {activeNote ? (
          <>
            {/* Note Editor Header Bar */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-4">
              <input
                type="text"
                value={activeNote.title}
                onChange={handleTitleChange}
                placeholder="Note Title..."
                className="text-lg font-bold text-primaryText bg-transparent focus:outline-none w-full"
              />

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-secondaryText flex items-center gap-1">
                  {saveStatus === 'saving' ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-accent-500" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Autosaved</span>
                    </>
                  )}
                </span>

                <button
                  onClick={() => handleSoftDelete(activeNote.id)}
                  className="p-1.5 text-secondaryText hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags Bar */}
            <div className="px-4 py-2 bg-background/40 border-b border-border flex items-center gap-2 text-xs">
              <Tag className="w-3.5 h-3.5 text-secondaryText" />
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeNote.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-accent-500/10 text-accent-500 rounded text-xs flex items-center gap-1">
                    #{tag}
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-transparent border-none text-xs text-primaryText focus:outline-none w-20"
                />
              </div>
            </div>

            {/* Tiptap Toolbar */}
            {editor && (
              <div className="px-4 py-1.5 border-b border-border flex items-center gap-1 bg-background/30 text-xs">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-1.5 rounded hover:bg-border/60 ${editor.isActive('bold') ? 'bg-border font-bold' : ''}`}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-1.5 rounded hover:bg-border/60 ${editor.isActive('italic') ? 'bg-border font-bold' : ''}`}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`p-1.5 rounded hover:bg-border/60 ${editor.isActive('heading', { level: 1 }) ? 'bg-border' : ''}`}
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`p-1.5 rounded hover:bg-border/60 ${editor.isActive('heading', { level: 2 }) ? 'bg-border' : ''}`}
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-1.5 rounded hover:bg-border/60 ${editor.isActive('bulletList') ? 'bg-border' : ''}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-1.5 rounded hover:bg-border/60 ${editor.isActive('orderedList') ? 'bg-border' : ''}`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`p-1.5 rounded hover:bg-border/60 ${editor.isActive('codeBlock') ? 'bg-border' : ''}`}
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tiptap Content Canvas */}
            <div className="flex-1 p-6 overflow-y-auto">
              <EditorContent editor={editor} className="text-sm text-primaryText focus:outline-none" />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-secondaryText text-sm">
            Select or create a note to start editing.
          </div>
        )}
      </div>
    </div>
  );
}
