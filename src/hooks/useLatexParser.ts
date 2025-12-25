import { useMemo } from 'react';

export interface ParsedSegment {
  type: 'text' | 'math' | 'chem';
  content: string;
  display: boolean; // block vs inline
}

// Simple heuristics for detecting LaTeX patterns
const LATEX_PATTERNS = {
  // Display math: $$ ... $$ or \[ ... \]
  displayMath: /\$\$(.+?)\$\$|\\\[(.+?)\\\]/gs,
  // Inline math: $ ... $ or \( ... \)
  inlineMath: /\$([^\$\n]+?)\$|\\\((.+?)\\\)/g,
  // Chemistry: \ce{...} or simple chemical formulas like H2O, CO2, NaCl
  chemistry: /\\ce\{([^}]+)\}|(?<![a-zA-Z])([A-Z][a-z]?\d*(?:\+|\-)?(?:[A-Z][a-z]?\d*(?:\+|\-)?)*(?:\s*(?:\+|->|→|⇌)\s*[A-Z][a-z]?\d*(?:\+|\-)?(?:[A-Z][a-z]?\d*(?:\+|\-)?)*)*)/g,
};

// Common math patterns that hint at LaTeX intent
const MATH_HEURISTICS = [
  /\b(sin|cos|tan|log|ln|exp|sqrt|sum|prod|int|lim|frac)\b/i,
  /\^[\{\d]/,  // superscript
  /_[\{\d]/,   // subscript
  /\\(alpha|beta|gamma|delta|theta|pi|sigma|omega|infty|partial|nabla)/i,
  /\{.*\}/,    // braces
  /\\(cdot|times|div|pm|mp|leq|geq|neq|approx)/i,
];

// Common chemistry patterns
const CHEM_HEURISTICS = [
  /^[A-Z][a-z]?\d*(\+|\-)?$/,  // Simple element with charge
  /[A-Z][a-z]?\d+/,  // Element with subscript number
  /(->|→|⇌|⇒)/,  // Reaction arrows
  /\b(mol|M|mM|pH|pOH|Ka|Kb|Kw|Ksp)\b/,
];

export function detectMathIntent(text: string): boolean {
  return MATH_HEURISTICS.some(pattern => pattern.test(text));
}

export function detectChemIntent(text: string): boolean {
  return CHEM_HEURISTICS.some(pattern => pattern.test(text));
}

export function parseLatex(
  text: string,
  options: { mathEnabled: boolean; chemEnabled: boolean }
): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let remaining = text;
  let lastIndex = 0;

  // First pass: extract display math
  if (options.mathEnabled) {
    const displayMatches = [...text.matchAll(LATEX_PATTERNS.displayMath)];
    for (const match of displayMatches) {
      const startIndex = match.index!;
      const content = match[1] || match[2];
      
      if (startIndex > lastIndex) {
        segments.push({
          type: 'text',
          content: text.slice(lastIndex, startIndex),
          display: false,
        });
      }
      
      segments.push({
        type: 'math',
        content: content.trim(),
        display: true,
      });
      
      lastIndex = startIndex + match[0].length;
    }
  }

  // If no display math found, process the whole text
  if (segments.length === 0) {
    remaining = text;
  } else {
    // Get remaining text after last match
    remaining = text.slice(lastIndex);
  }

  // Second pass: extract inline math and chemistry from remaining text
  if (remaining && (options.mathEnabled || options.chemEnabled)) {
    const inlineSegments = parseInlineContent(remaining, options);
    segments.push(...inlineSegments);
  } else if (remaining) {
    segments.push({ type: 'text', content: remaining, display: false });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text, display: false }];
}

function parseInlineContent(
  text: string,
  options: { mathEnabled: boolean; chemEnabled: boolean }
): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    // Check for inline math: $...$
    if (options.mathEnabled && text[i] === '$' && text[i + 1] !== '$') {
      const endIndex = text.indexOf('$', i + 1);
      if (endIndex > i + 1) {
        if (currentText) {
          segments.push({ type: 'text', content: currentText, display: false });
          currentText = '';
        }
        segments.push({
          type: 'math',
          content: text.slice(i + 1, endIndex),
          display: false,
        });
        i = endIndex + 1;
        continue;
      }
    }

    // Check for \(...\)
    if (options.mathEnabled && text[i] === '\\' && text[i + 1] === '(') {
      const endIndex = text.indexOf('\\)', i + 2);
      if (endIndex > i + 2) {
        if (currentText) {
          segments.push({ type: 'text', content: currentText, display: false });
          currentText = '';
        }
        segments.push({
          type: 'math',
          content: text.slice(i + 2, endIndex),
          display: false,
        });
        i = endIndex + 2;
        continue;
      }
    }

    // Check for \ce{...} chemistry
    if (options.chemEnabled && text.slice(i, i + 4) === '\\ce{') {
      const endIndex = text.indexOf('}', i + 4);
      if (endIndex > i + 4) {
        if (currentText) {
          segments.push({ type: 'text', content: currentText, display: false });
          currentText = '';
        }
        segments.push({
          type: 'chem',
          content: text.slice(i + 4, endIndex),
          display: false,
        });
        i = endIndex + 1;
        continue;
      }
    }

    currentText += text[i];
    i++;
  }

  if (currentText) {
    segments.push({ type: 'text', content: currentText, display: false });
  }

  return segments;
}

export function useLatexParser(
  text: string,
  options: { mathEnabled: boolean; chemEnabled: boolean }
) {
  return useMemo(() => parseLatex(text, options), [text, options.mathEnabled, options.chemEnabled]);
}

// Convert simple chemical notation to proper display
export function formatChemistry(formula: string): string {
  return formula
    .replace(/(\d+)/g, '_{$1}')  // subscripts for numbers
    .replace(/\+/g, '^{+}')      // superscript for positive charge
    .replace(/(?<![\^])-/g, '^{-}')  // superscript for negative charge
    .replace(/->/g, '\\rightarrow')
    .replace(/→/g, '\\rightarrow')
    .replace(/⇌/g, '\\rightleftharpoons');
}
