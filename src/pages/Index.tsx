import NoteEditor from '@/components/NoteEditor';

const Index = () => {
  const sampleContent = `Welcome to STEM Notes! ✨

Here's an example of inline math: The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$

And here's a block equation:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

Chemistry works too! Water is \\ce{H2O} and here's a reaction:
\\ce{2H2 + O2 -> 2H2O}

Try writing your own equations below!`;

  return (
    <div className="min-h-screen bg-background py-8">
      <NoteEditor initialContent={sampleContent} />
    </div>
  );
};

export default Index;
