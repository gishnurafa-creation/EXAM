import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter',
});

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      try {
        ref.current.removeAttribute('data-processed');
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        mermaid.render(id, chart).then((result) => {
          if (ref.current) {
            ref.current.innerHTML = result.svg;
          }
        }).catch(err => {
          console.error("Mermaid render error:", err);
          if (ref.current) {
            ref.current.innerHTML = `<div class="text-red-500 text-xs p-2 bg-red-50 rounded">Failed to render diagram.</div>`;
          }
        });
      } catch (err) {
        console.error("Mermaid initialization error:", err);
      }
    }
  }, [chart]);

  return <div key={chart} ref={ref} className="mermaid-chart overflow-x-auto my-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm" />;
};

export default Mermaid;
