import React from 'react';
import { useLatexParser, ParsedSegment } from '@/hooks/useLatexParser';
import MathRenderer from './MathRenderer';

interface RenderedNoteProps {
  content: string;
  mathEnabled: boolean;
  chemEnabled: boolean;
}

const RenderedNote: React.FC<RenderedNoteProps> = ({
  content,
  mathEnabled,
  chemEnabled,
}) => {
  // Split content by lines for better rendering
  const lines = content.split('\n');

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {lines.map((line, lineIndex) => (
        <RenderLine
          key={lineIndex}
          line={line}
          mathEnabled={mathEnabled}
          chemEnabled={chemEnabled}
        />
      ))}
    </div>
  );
};

interface RenderLineProps {
  line: string;
  mathEnabled: boolean;
  chemEnabled: boolean;
}

const RenderLine: React.FC<RenderLineProps> = ({ line, mathEnabled, chemEnabled }) => {
  const segments = useLatexParser(line, { mathEnabled, chemEnabled });

  if (!line.trim()) {
    return <div className="h-4" />;
  }

  return (
    <p className="my-2 leading-relaxed">
      {segments.map((segment, index) => (
        <RenderSegment key={index} segment={segment} />
      ))}
    </p>
  );
};

interface RenderSegmentProps {
  segment: ParsedSegment;
}

const RenderSegment: React.FC<RenderSegmentProps> = ({ segment }) => {
  switch (segment.type) {
    case 'math':
      return (
        <MathRenderer
          content={segment.content}
          display={segment.display}
          type="math"
          className="text-primary"
        />
      );
    case 'chem':
      return (
        <MathRenderer
          content={segment.content}
          display={segment.display}
          type="chem"
          className="text-emerald-600 dark:text-emerald-400"
        />
      );
    case 'text':
    default:
      return <span>{segment.content}</span>;
  }
};

export default RenderedNote;
