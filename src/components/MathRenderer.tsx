import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { formatChemistry } from '@/hooks/useLatexParser';

interface MathRendererProps {
  content: string;
  display?: boolean;
  type?: 'math' | 'chem';
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  display = false,
  type = 'math',
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        let latex = content;
        
        // Format chemistry notation
        if (type === 'chem') {
          latex = formatChemistry(content);
        }

        katex.render(latex, containerRef.current, {
          displayMode: display,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: {
            '\\ce': (context: any) => {
              return formatChemistry(context.consumeArgs(1)[0].map((t: any) => t.text).join(''));
            },
          },
        });
      } catch (error) {
        console.warn('KaTeX render error:', error);
        if (containerRef.current) {
          containerRef.current.textContent = content;
        }
      }
    }
  }, [content, display, type]);

  return (
    <span
      ref={containerRef}
      className={`${display ? 'block my-4 text-center' : 'inline'} ${className}`}
    />
  );
};

export default MathRenderer;
