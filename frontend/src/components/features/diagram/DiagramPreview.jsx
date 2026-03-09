import { initializeMermaid, renderInto } from "@/lib/mermaid";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useEffect, useRef } from "react";

export default function DiagramPreview({ code }) {
  const containerRef = useRef(null);
  const { currentTheme } = useDiagramStore();

  useEffect(() => {
    initializeMermaid({ theme: currentTheme });
  }, [currentTheme]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !code) return;

    let mounted = true;

    (async () => {
      try {
        await renderInto(el, code);
      } catch (error) {
        console.error("Mermaid render error:", error);
        if (mounted && el) {
          el.innerHTML = `
            <div class="flex items-center justify-center h-full p-8">
              <div class="text-center">
                <p class="text-red-600 font-semibold mb-2">Failed to render diagram</p>
                <p class="text-sm text-gray-600">Invalid Mermaid syntax</p>
              </div>
            </div>
          `;
        }
      }

      if (!mounted) return;
    })();

    return () => {
      mounted = false;
    };
  }, [code, currentTheme]);

  if (!code) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">No diagram code available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    />
  );
}
