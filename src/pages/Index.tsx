import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { useNotes } from '@/hooks/useNotes';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
    folders,
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
  } = useNotes();

  const [showPreview, setShowPreview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleCreateFolder = () => {
    const name = prompt('Folder name:');
    if (name?.trim()) {
      createFolder(name.trim());
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      {!fullscreen && (
        <Sidebar
          folders={folders}
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          onCreateNote={createNote}
          onDeleteNote={deleteNote}
          onCreateFolder={handleCreateFolder}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 border-b border-border flex items-center justify-end gap-2 px-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Editor / Preview area */}
        <div className="flex-1 flex overflow-hidden">
          {activeNote ? (
            <>
              <div className={cn('flex-1 overflow-y-auto', showPreview && 'border-r border-border')}>
                <Editor
                  content={activeNote.content}
                  title={activeNote.title}
                  onChange={(content) => updateNote(activeNote.id, { content })}
                  onTitleChange={(title) => updateNote(activeNote.id, { title })}
                />
              </div>
              {showPreview && (
                <div className="flex-1 overflow-y-auto">
                  <Preview content={activeNote.content} title={activeNote.title} />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select or create a note to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
