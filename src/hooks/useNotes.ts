import { useState, useCallback } from 'react';
import { Note, Folder } from '@/types/notes';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultFolders: Folder[] = [
  { id: 'inbox', name: 'Inbox', parentId: null },
  { id: 'archive', name: 'Archive', parentId: null },
];

const defaultNotes: Note[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    content: `# Welcome to STEM Notes

A minimal note-taking app for scientific work.

## Math Support

Write inline math like $E = mc^2$ or display equations:

$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

## Chemistry

Write reactions: H2O, CO2, NaCl -> Na+ + Cl-

## Linking

Create [[wiki-style links]] to connect your notes.`,
    folderId: 'inbox',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function useNotes() {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>('welcome');

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  const createNote = useCallback((folderId: string | null = 'inbox') => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled',
      content: '',
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
    setActiveNoteId(newNote.id);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const createFolder = useCallback((name: string, parentId: string | null = null) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      parentId,
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setNotes((prev) => prev.filter((n) => n.folderId !== id));
  }, []);

  const getNotesInFolder = useCallback(
    (folderId: string | null) => notes.filter((n) => n.folderId === folderId),
    [notes]
  );

  return {
    folders,
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    deleteFolder,
    getNotesInFolder,
  };
}
