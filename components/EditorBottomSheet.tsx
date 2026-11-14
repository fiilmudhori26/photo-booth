"use client";

import type { ReactNode } from "react";
import { cx } from "./ui";

interface EditorBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function EditorBottomSheet({
  open,
  onClose,
  children,
}: EditorBottomSheetProps) {
  return (
    <div
      className={cx(
        "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300",
        open ? "translate-y-0" : "translate-y-full",
      )}
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="mb-2 flex justify-center">
        <div className="h-1 w-12 rounded-full bg-slate-400/50" />
      </div>
      <div className="max-h-96 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
