import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  displayMode?: boolean;
}

export function MathRenderer({ content, displayMode = false }: MathRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(content, containerRef.current, {
          displayMode,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch (error) {
        console.warn('KaTeX render error:', error);
        if (containerRef.current) {
          containerRef.current.textContent = content;
        }
      }
    }
  }, [content, displayMode]);

  return (
    <span
      ref={containerRef}
      className={displayMode ? 'block text-center' : 'inline'}
    />
  );
}
