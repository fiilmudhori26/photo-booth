"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Dark theme components

export function Stepper({
  step,
  onChange,
  disabled = false,
}: {
  step: "select" | "capture" | "edit" | "export";
  onChange: (step: "select" | "capture" | "edit" | "export") => void;
  /** Disable step navigation (e.g. while a capture sequence is running). */
  disabled?: boolean;
}) {
  const steps = [
    { id: "select" as const, label: "Template" },
    { id: "capture" as const, label: "Capture" },
    { id: "edit" as const, label: "Edit" },
    { id: "export" as const, label: "Export" },
  ];
  const order = { select: 0, capture: 1, edit: 2, export: 3 } as const;
  const currentIndex = order[step];

  return (
    <nav
      aria-label="Photo booth steps"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-around gap-1 px-4 py-2">
        {steps.map(({ id, label }) => {
          const isActive = id === step;
          const isCompleted = order[id] < currentIndex;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              disabled={disabled}
              aria-disabled={disabled || undefined}
              aria-current={isActive ? "step" : undefined}
              className={cx(
                "flex min-h-14 min-w-16 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed",
                disabled
                  ? "opacity-45"
                  : isActive
                    ? "text-indigo-300"
                    : isCompleted
                      ? "text-slate-200 hover:text-white"
                      : "text-slate-400 hover:text-slate-300",
              )}
            >
              <span>{label}</span>
              <span
                aria-hidden="true"
                className={cx(
                  "h-1 w-6 rounded-full transition-colors",
                  isActive
                    ? "bg-indigo-500"
                    : isCompleted
                      ? "bg-slate-600"
                      : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileButton({
  variant = "primary",
  icon,
  block,
  size = "md",
  className,
  children,
  ...rest
}: {
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  block?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary:
      "border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500",
    secondary:
      "border-slate-700/50 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60",
  };

  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] font-bold transition active:translate-y-[1px] active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm"
          ? "min-h-10 px-3 text-sm"
          : size === "lg"
            ? "min-h-12 px-5 text-base"
            : "min-h-11 px-4 text-sm",
        block && "w-full",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

