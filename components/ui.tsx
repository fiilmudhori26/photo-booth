"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-petal to-rose text-white border-white/70 shadow-[0_10px_0_-3px_rgba(219,39,119,0.5),0_20px_32px_-20px_rgba(244,114,182,0.95)] hover:brightness-105",
  secondary:
    "bg-white text-ink border-white shadow-[0_12px_26px_-18px_rgba(196,110,160,0.9)] hover:bg-vanilla",
  ghost: "bg-white/60 text-ink border-transparent hover:bg-white",
};

interface KawaiiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  block?: boolean;
  small?: boolean;
}

export function KawaiiButton({
  variant = "secondary",
  icon,
  block,
  small,
  className,
  children,
  ...rest
}: KawaiiButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full border-[3px] font-bold transition active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50",
        small ? "min-h-11 px-4 text-sm" : "min-h-12 px-6 text-base",
        block && "w-full",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({
  className,
  label,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex size-11 items-center justify-center rounded-full border-[3px] border-white bg-white/85 text-ink shadow-[0_10px_20px_-14px_rgba(196,110,160,0.9)] backdrop-blur transition hover:bg-white active:translate-y-[2px]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Chip({
  active,
  className,
  onClick,
  children,
}: {
  active?: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex min-h-11 items-center gap-2 rounded-2xl border-[3px] px-3 py-2 text-xs font-bold transition active:translate-y-[2px]",
        active
          ? "border-rose bg-gradient-to-b from-bubble to-blush text-ink shadow-[0_10px_18px_-14px_rgba(244,114,182,1)]"
          : "border-white bg-white/70 text-inksoft hover:bg-white hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Panel({
  title,
  icon,
  hint,
  children,
  className,
}: {
  title?: string;
  icon?: ReactNode;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("kawaii-card p-5 sm:p-6", className)}>
      {title && (
        <header className="mb-4 flex flex-wrap items-center gap-2">
          {icon && <span className="text-xl leading-none">{icon}</span>}
          <h2 className="font-display text-lg leading-none text-ink">{title}</h2>
          {hint && (
            <span className="ml-auto font-hand text-sm text-inksoft">{hint}</span>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatPill({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white/70 px-3 py-1 text-xs font-bold text-inksoft">
      {icon}
      {children}
    </span>
  );
}

// ── Dark Theme Mobile Components ─────────────────────────────────────

export function Stepper({
  step,
  onChange,
}: {
  step: "select" | "capture" | "edit" | "export";
  onChange: (step: "select" | "capture" | "edit" | "export") => void;
}) {
  const steps = [
    { id: "select" as const, label: "Template" },
    { id: "capture" as const, label: "Capture" },
    { id: "edit" as const, label: "Edit" },
    { id: "export" as const, label: "Export" },
  ];

  return (
    <nav className="fixed bottom-16 left-0 right-0 mx-auto w-full max-w-md justify-center gap-1 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center justify-around">
        {steps.map(({ id, label }) => {
          const isActive = id === step;
          const isCompleted =
            (id === "select" && step !== "select") ||
            (id === "capture" && step === "capture") ||
            (id === "edit" && (step === "edit" || step === "capture")) ||
            (id === "export" && step !== "select");

          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={cx(
                "flex flex-col items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition",
                isActive
                  ? "text-indigo-400"
                  : isCompleted
                    ? "text-slate-300"
                    : "text-slate-500",
              )}
            >
              {label}
              {isActive && (
                <div className="mt-0.5 h-1 w-6 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobilePanel({
  title,
  hint,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-2xl border-[3px] border-slate-700/50 bg-slate-900/60 p-5",
        className,
      )}
    >
      {title && (
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg leading-none text-white">
              {title}
            </h2>
            {hint && (
              <span className="font-hand text-sm text-slate-400">{hint}</span>
            )}
          </div>
        </header>
      )}
      {children}
    </section>
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
        "inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] font-bold transition active:translate-y-[1px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50",
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

export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
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
