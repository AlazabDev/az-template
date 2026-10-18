import React, { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
}

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'neutral',
  fontFamily: 'inherit',
});

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
  const generatedId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const renderDiagram = async () => {
      setError('');
      setSvg('');
      try {
        const { svg: renderedSvg } = await mermaid.render(`agent-diagram-${generatedId}`, code.trim());
        if (!cancelled) setSvg(renderedSvg);
      } catch {
        if (!cancelled) setError('تعذر رسم المخطط. يمكنك استخدام الكود أدناه وتصحيحه أو طلب إعادة توليده.');
      }
    };
    void renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [code, generatedId]);

  return (
    <div className="my-3 overflow-hidden rounded-lg border bg-white p-3" dir="ltr">
      {svg ? (
        <div className="overflow-x-auto" aria-label="مخطط Mermaid" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : error ? (
        <p className="mb-2 text-sm text-destructive" dir="rtl">{error}</p>
      ) : (
        <p className="text-sm text-muted-foreground" dir="rtl">جارٍ رسم المخطط...</p>
      )}
      {(error || !svg) && (
        <details className="mt-2" dir="rtl">
          <summary className="cursor-pointer text-xs text-muted-foreground">عرض كود Mermaid</summary>
          <pre className="mt-2 overflow-x-auto rounded bg-slate-100 p-3 text-left text-xs" dir="ltr"><code>{code.trim()}</code></pre>
        </details>
      )}
    </div>
  );
};

export default MermaidDiagram;
