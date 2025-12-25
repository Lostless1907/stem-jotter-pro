import { Folder, Note } from '@/types/notes';
import { FolderIcon, FileText, Plus, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  folders: Folder[];
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (folderId: string | null) => void;
  onDeleteNote: (id: string) => void;
  onCreateFolder: () => void;
}

export function Sidebar({
  folders,
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onCreateFolder,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(folders.map((f) => f.id))
  );

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getNotesInFolder = (folderId: string) =>
    notes.filter((n) => n.folderId === folderId);

  const rootFolders = folders.filter((f) => f.parentId === null);

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-sidebar-foreground tracking-tight">
          STEM Notes
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {rootFolders.map((folder) => {
          const isExpanded = expandedFolders.has(folder.id);
          const folderNotes = getNotesInFolder(folder.id);

          return (
            <div key={folder.id} className="mb-1">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm group"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sidebar-foreground/60" />
                )}
                <FolderIcon className="w-4 h-4 text-sidebar-foreground/60" />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNote(folder.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-sidebar-accent rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </button>

              {isExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {folderNotes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer group',
                        activeNoteId === note.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80'
                      )}
                      onClick={() => onSelectNote(note.id)}
                    >
                      <FileText className="w-4 h-4 shrink-0 opacity-60" />
                      <span className="flex-1 truncate">
                        {note.title || 'Untitled'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/20 hover:text-destructive rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {folderNotes.length === 0 && (
                    <p className="px-2 py-1 text-xs text-sidebar-foreground/40 italic">
                      Empty
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onCreateFolder}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      </div>
    </aside>
  );
}
