"use client";

import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";

function scrollToPageEdge(edge: "top" | "bottom") {
  const scrollElement = document.scrollingElement ?? document.documentElement;
  const top = edge === "top" ? 0 : scrollElement.scrollHeight - window.innerHeight;

  window.scrollTo({
    behavior: "smooth",
    top,
  });
}

export function ScrollControls() {
  return (
    <div className="scroll-controls" aria-label="Page scroll controls">
      <button
        aria-label="Scroll to top"
        className="scroll-control-button"
        onClick={() => scrollToPageEdge("top")}
        type="button"
      >
        <ArrowUpToLine size={18} />
      </button>
      <button
        aria-label="Scroll to bottom"
        className="scroll-control-button"
        onClick={() => scrollToPageEdge("bottom")}
        type="button"
      >
        <ArrowDownToLine size={18} />
      </button>
    </div>
  );
}
