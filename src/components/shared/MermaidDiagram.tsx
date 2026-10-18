import React, { useEffect, useId, useState } from 'react';
import { Download, FileImage, Loader2 } from 'lucide-react';
import mermaid from 'mermaid';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

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
  const [exporting, setExporting] = useState<'svg' | 'png' | null>(null);

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

  const downloadBlob = (blob: Blob, extension: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `azab-agent-diagram-${generatedId}.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportSvg = () => {
    if (!svg) return;
    setExporting('svg');
    try {
      downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'svg');
      toast.success('تم تصدير المخطط بصيغة SVG');
    } catch {
      toast.error('تعذر تصدير المخطط بصيغة SVG');
    } finally {
      setExporting(null);
    }
  };

  const exportPng = async () => {
    if (!svg) return;
    setExporting('png');
    try {
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.decoding = 'async';
      image.src = svgUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('image-load-failed'));
      });
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(image.naturalWidth, 1) * scale;
      canvas.height = Math.max(image.naturalHeight, 1) * scale;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('canvas-unavailable');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.scale(scale, scale);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(svgUrl);
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!pngBlob) throw new Error('png-export-failed');
      downloadBlob(pngBlob, 'png');
      toast.success('تم تصدير المخطط بصيغة PNG');
    } catch {
      toast.error('تعذر تصدير المخطط بصيغة PNG');
    } finally {
      setExporting(null);
    }
  };

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
      {svg && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" dir="rtl">
          <span className="text-xs text-muted-foreground">تصدير المخطط:</span>
          <Button type="button" variant="outline" size="sm" onClick={exportSvg} disabled={exporting !== null}>
            {exporting === 'svg' ? <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" /> : <Download className="ml-1 h-3.5 w-3.5" />}
            SVG
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void exportPng()} disabled={exporting !== null}>
            {exporting === 'png' ? <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" /> : <FileImage className="ml-1 h-3.5 w-3.5" />}
            PNG
          </Button>
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram;
