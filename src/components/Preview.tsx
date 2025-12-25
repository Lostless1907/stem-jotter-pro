import { useMemo } from 'react';
import { MathRenderer } from './MathRenderer';

interface PreviewProps {
  content: string;
  title: string;
}

// Simple parser for markdown-like content with math support
function parseContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Display math block
    if (line.trim().startsWith('$$')) {
      let mathContent = '';
      if (line.trim() === '$$') {
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('$$')) {
          mathContent += lines[i] + '\n';
          i++;
        }
      } else {
        mathContent = line.trim().slice(2, -2);
      }
      elements.push(
        <div key={i} className="my-4">
          <MathRenderer content={mathContent.trim()} displayMode />
        </div>
      );
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold mt-6 mb-3 text-foreground">
          {parseLine(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-semibold mt-5 mb-2 text-foreground">
          {parseLine(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-medium mt-4 mb-2 text-foreground">
          {parseLine(line.slice(4))}
        </h3>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-4" />);
    } else {
      elements.push(
        <p key={i} className="text-foreground/90 leading-relaxed mb-2">
          {parseLine(line)}
        </p>
      );
    }

    i++;
  }

  return elements;
}

// Parse inline elements
function parseLine(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Inline math
    const mathMatch = remaining.match(/\$([^$]+)\$/);
    if (mathMatch && mathMatch.index !== undefined) {
      if (mathMatch.index > 0) {
        parts.push(
          <span key={keyIndex++}>{parseTextFormatting(remaining.slice(0, mathMatch.index))}</span>
        );
      }
      parts.push(
        <MathRenderer key={keyIndex++} content={mathMatch[1]} displayMode={false} />
      );
      remaining = remaining.slice(mathMatch.index + mathMatch[0].length);
      continue;
    }

    // Wiki links
    const wikiMatch = remaining.match(/\[\[([^\]]+)\]\]/);
    if (wikiMatch && wikiMatch.index !== undefined) {
      if (wikiMatch.index > 0) {
        parts.push(
          <span key={keyIndex++}>{parseTextFormatting(remaining.slice(0, wikiMatch.index))}</span>
        );
      }
      parts.push(
        <span
          key={keyIndex++}
          className="text-primary underline decoration-primary/30 hover:decoration-primary cursor-pointer"
        >
          {wikiMatch[1]}
        </span>
      );
      remaining = remaining.slice(wikiMatch.index + wikiMatch[0].length);
      continue;
    }

    // No more special patterns
    parts.push(<span key={keyIndex++}>{parseTextFormatting(remaining)}</span>);
    break;
  }

  return parts;
}

// Simple text formatting (bold, italic, code)
function parseTextFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(<span key={keyIndex++}>{remaining.slice(0, codeMatch.index)}</span>);
      }
      parts.push(
        <code
          key={keyIndex++}
          className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      continue;
    }

    // Bold
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={keyIndex++}>{remaining.slice(0, boldMatch.index)}</span>);
      }
      parts.push(
        <strong key={keyIndex++} className="font-semibold">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/\*([^*]+)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(<span key={keyIndex++}>{remaining.slice(0, italicMatch.index)}</span>);
      }
      parts.push(
        <em key={keyIndex++} className="italic">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    // Chemical formulas (simple heuristic: uppercase letter followed by numbers)
    const chemMatch = remaining.match(/\b([A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*(?:\s*[-+→]\s*[A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*)*)\b/);
    if (chemMatch && chemMatch.index !== undefined && /\d/.test(chemMatch[1])) {
      if (chemMatch.index > 0) {
        parts.push(<span key={keyIndex++}>{remaining.slice(0, chemMatch.index)}</span>);
      }
      // Format chemistry with subscripts
      const formatted = chemMatch[1].replace(/(\d+)/g, '<sub>$1</sub>');
      parts.push(
        <span
          key={keyIndex++}
          className="font-mono"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
      remaining = remaining.slice(chemMatch.index + chemMatch[0].length);
      continue;
    }

    parts.push(<span key={keyIndex++}>{remaining}</span>);
    break;
  }

  return parts;
}

export function Preview({ content, title }: PreviewProps) {
  const rendered = useMemo(() => parseContent(content), [content]);

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto px-8 py-8">
        <h1 className="text-3xl font-semibold mb-6 text-foreground">
          {title || 'Untitled'}
        </h1>
        <div className="prose-content">{rendered}</div>
      </div>
    </div>
  );
}
