"use client";

import type { ReactNode } from "react";

interface EditorBottomSheetProps {
  open: boolean;
  children: ReactNode;
  title?: string;
}

/**
 * Edit tools container. Rendered inline in the page flow (not as a fixed
 * overlay) so the photo preview and the controls never cover each other.
 */
export default function EditorBottomSheet({
  open,
  children,
  title = "Studio tools",
}: EditorBottomSheetProps) {
  if (!open) return null;

  return (
    <section
      role="region"
      aria-label={title}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"
    >
      <h2 className="mb-3 font-display text-sm tracking-wide text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}
