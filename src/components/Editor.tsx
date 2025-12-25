import { useRef, useEffect } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  title: string;
}

export function Editor({ content, onChange, onTitleChange, title }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <div className="h-full flex flex-col bg-background">
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled"
        className="px-8 pt-8 pb-4 text-3xl font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50"
      />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing..."
        className="flex-1 px-8 pb-8 text-base leading-relaxed bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 font-mono"
        spellCheck={false}
      />
    </div>
  );
}
