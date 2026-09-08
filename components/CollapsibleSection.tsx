"use client";

import { useState, type ReactNode } from "react";

/**
 * A `.card` with a clickable header that expands/collapses its body.
 * Used to keep the property detail page from getting too long — most
 * sections start collapsed except the one passed `defaultOpen`.
 */
export default function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={open}
      >
        <h2 className="section-title mb-0">{title}</h2>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
