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
