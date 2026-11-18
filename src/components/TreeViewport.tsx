import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Maximize, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Keep the tree's natural layout intact while fitting its visible branches to the viewport. */
export function TreeViewport({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [available, setAvailable] = useState({ width: 1, height: 1 });
  const [manualScale, setManualScale] = useState<number | null>(null);
  const fitScale = Math.min(1, available.width / size.width);
  const scale = manualScale ?? fitScale;

  useLayoutEffect(() => {
    const frame = viewport.current;
    const tree = content.current;
    if (!frame || !tree) return;
    const measure = () => {
      setSize({ width: tree.offsetWidth || 1, height: tree.offsetHeight || 1 });
      setAvailable({ width: Math.max(1, frame.clientWidth - 24), height: Math.max(1, frame.clientHeight - 24) });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(tree);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-label="Family tree overview" className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Button variant={manualScale === null ? "secondary" : "outline"} size="sm" onClick={() => setManualScale(null)}>
          <Maximize className="mr-2 h-4 w-4" />Fit tree
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Zoom out" title="Zoom out" onClick={() => setManualScale(Math.max(0.01, scale / 1.4))}><Minus className="h-4 w-4" /></Button>
          <output aria-label="Tree zoom" className="w-12 text-center text-xs tabular-nums text-muted-foreground">{Math.round(scale * 100)}%</output>
          <Button variant="outline" size="icon" aria-label="Zoom in" title="Zoom in" onClick={() => setManualScale(Math.min(2, scale * 1.4))}><Plus className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Actual size" title="Actual size" onClick={() => setManualScale(1)}><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </div>
      <div ref={viewport} className="h-[62svh] min-h-[300px] overflow-auto overscroll-contain rounded-lg border border-border bg-muted/30 p-3">
        <div className="relative mx-auto" style={{ width: size.width * scale, height: size.height * scale }}>
          <div ref={content} className="absolute left-0 top-0 w-max origin-top-left" style={{ transform: `scale(${scale})` }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}