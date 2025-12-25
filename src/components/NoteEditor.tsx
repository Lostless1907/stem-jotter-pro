import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { detectMathIntent, detectChemIntent } from '@/hooks/useLatexParser';
import RenderedNote from './RenderedNote';
import { Calculator, FlaskConical, Eye, Edit3, Sparkles } from 'lucide-react';

interface NoteEditorProps {
  initialContent?: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [mathEnabled, setMathEnabled] = useState(true);
  const [chemEnabled, setChemEnabled] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [hasMathHint, setHasMathHint] = useState(false);
  const [hasChemHint, setHasChemHint] = useState(false);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Update heuristic hints
    setHasMathHint(detectMathIntent(newContent));
    setHasChemHint(detectChemIntent(newContent));
  }, []);

  const insertTemplate = useCallback((template: string) => {
    setContent(prev => prev + (prev ? '\n' : '') + template);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">STEM Notes</h1>
        </div>
        
        {/* Mode Toggles */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Calculator className={`w-4 h-4 ${mathEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
            <Switch
              id="math-mode"
              checked={mathEnabled}
              onCheckedChange={setMathEnabled}
            />
            <Label htmlFor="math-mode" className="text-sm font-medium">
              Math
            </Label>
            {hasMathHint && !mathEnabled && (
              <Badge variant="outline" className="text-xs animate-pulse">
                Math detected
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <FlaskConical className={`w-4 h-4 ${chemEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
            <Switch
              id="chem-mode"
              checked={chemEnabled}
              onCheckedChange={setChemEnabled}
            />
            <Label htmlFor="chem-mode" className="text-sm font-medium">
              Chemistry
            </Label>
            {hasChemHint && !chemEnabled && (
              <Badge variant="outline" className="text-xs animate-pulse">
                Chem detected
              </Badge>
            )}
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <Eye className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
            {showPreview ? 'Preview' : 'Edit Only'}
          </Button>
        </div>
      </div>

      {/* Quick Insert Templates */}
      <Card className="bg-card/50">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Quick Insert</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate('$x^2 + y^2 = r^2$')}
            >
              x² + y² = r²
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate('$$\\frac{d}{dx}f(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$')}
            >
              Derivative
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate('$$\\int_a^b f(x)\\,dx$$')}
            >
              Integral
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate('$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$')}
            >
              Summation
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate('\\ce{H2O}')}
            >
              H₂O
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate('\\ce{2H2 + O2 -> 2H2O}')}
            >
              Reaction
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate('\\ce{CH3COOH}')}
            >
              Acetic Acid
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertTemplate('$$\\ce{pH} = -\\log[\\ce{H+}]$$')}
            >
              pH Formula
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor & Preview */}
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <Card className="min-h-[400px]">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder={`Write your STEM notes here...

Math examples:
• Inline: $E = mc^2$
• Block: $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

Chemistry examples:
• \\ce{H2SO4}
• \\ce{NaOH + HCl -> NaCl + H2O}`}
              className="min-h-[350px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card className="min-h-[400px]">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Rendered Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <RenderedNote
                content={content}
                mathEnabled={mathEnabled}
                chemEnabled={chemEnabled}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Syntax Help */}
      <Card className="bg-muted/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Syntax Reference</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Math (LaTeX)
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">$...$</code> — Inline math</li>
                <li><code className="bg-muted px-1 rounded">$$...$$</code> — Block math</li>
                <li><code className="bg-muted px-1 rounded">\(...\)</code> — Inline alt</li>
                <li><code className="bg-muted px-1 rounded">\[...\]</code> — Block alt</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Chemistry
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">\ce{'{H2O}'}</code> — Chemical formula</li>
                <li><code className="bg-muted px-1 rounded">\ce{'{A + B -> C}'}</code> — Reaction</li>
                <li><code className="bg-muted px-1 rounded">\ce{'{Ca^2+}'}</code> — Ions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteEditor;
