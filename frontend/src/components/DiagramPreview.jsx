// src/features/diagram/components/DiagramPreview.jsx
import { useEffect, useRef } from "react";
import { initializeMermaid, renderInto } from "@/lib/mermaid";
import { cn } from "@/utils/cn";

export default function DiagramPreview({ code }) {
  const containerRef = useRef(null);

  useEffect(() => {
    initializeMermaid({ theme: "forest" });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return; 
    let mounted = true;
    (async () => {
      await renderInto(el,code);

      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [code]);

  return <div ref={containerRef} className= {cn(
    'border-t border-l border-neutral-100 bg-[#edf4ff]', 
    'shadow-[7px_7px_0px_0px_black]',
  )} />;
}
