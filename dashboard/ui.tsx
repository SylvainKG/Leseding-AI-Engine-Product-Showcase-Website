"use client";

import { forwardRef, useId } from "react";
import { CheckCircle2, AlertTriangle, Clock, Circle, Search, type LucideIcon } from "lucide-react";

export function Card({
  title,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-2 px-3.5 pt-3">
          {title && <h3 className="text-[12.5px] font-semibold text-fg">{title}</h3>}
          {action}
        </header>
      )}
      <div className={`p-3.5 ${title || action ? "pt-2.5" : ""} ${bodyClassName}`}>{children}</div>
    </section>
  );
}

type Tone = "success" | "warning" | "primary" | "muted" | "danger";

const toneClass: Record<Tone, string> = {
  success: "text-success bg-success/12 ring-success/25",
  warning: "text-warning bg-warning/12 ring-warning/25",
  primary: "text-primary bg-primary/14 ring-primary/30",
  muted: "text-muted bg-fg/6 ring-line",
  danger: "text-danger bg-danger/12 ring-danger/25",
};

const toneIcon: Record<Tone, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  primary: Clock,
  muted: Circle,
  danger: AlertTriangle,
};

/** Status badge — always pairs colour with an icon and text. */
export function Badge({ tone, children, icon = true }: { tone: Tone; children: React.ReactNode; icon?: boolean }) {
  const Icon = toneIcon[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1 ring-inset ${toneClass[tone]}`}
    >
      {icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  if (["Resolved", "Published", "Completed", "Updated"].includes(status)) return "success";
  if (["Escalated", "Needs review"].includes(status)) return "warning";
  if (["In progress"].includes(status)) return "primary";
  return "muted";
}

export function DemoTag({ children = "Demo data" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-line-strong px-1.5 py-0.5 text-[10px] font-medium text-muted">
      <span className="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
      {children}
    </span>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost";

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" }
>(function Button({ variant = "secondary", size = "sm", className = "", ...props }, ref) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45";
  const sizes = size === "sm" ? "h-8 px-3 text-[12px]" : "h-10 px-4 text-sm";
  const variants: Record<BtnVariant, string> = {
    primary: "bg-primary text-primary-contrast hover:bg-primary-hover active:bg-primary-active disabled:hover:bg-primary",
    secondary: "border border-line bg-raised text-fg hover:border-line-strong active:bg-sunken",
    ghost: "text-muted hover:bg-fg/6 hover:text-fg",
  };
  return <button ref={ref} type="button" className={`${base} ${sizes} ${variants[variant]} ${className}`} {...props} />;
});

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[11.5px] font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10.5px] text-muted">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-sunken px-2.5 py-1.5 text-[12.5px] text-fg placeholder:text-muted/70 outline-none transition-colors hover:border-line-strong focus:border-primary focus-visible:outline-none focus:ring-2 focus:ring-primary/30";

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  const id = useId();
  return (
    <div className="relative min-w-[150px] flex-[1_1_180px]">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pl-8`}
      />
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  label,
  id,
  srLabel = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<string | { value: string; label: string }>;
  label: string;
  id?: string;
  srLabel?: boolean;
}) {
  const autoId = useId();
  const sid = id ?? autoId;
  return (
    <>
      {srLabel && (
        <label htmlFor={sid} className="sr-only">
          {label}
        </label>
      )}
      <select id={sid} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass.replace("w-full ", "")} w-auto max-w-full pr-7`}>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p id={id} className="text-[12px] font-medium text-fg">
          {label}
        </p>
        {description && <p className="text-[10.5px] text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-line-strong"}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-fg/6 text-muted">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-[12.5px] font-semibold text-fg">{title}</p>
      <p className="mt-1 max-w-xs text-[11.5px] text-muted">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function IconTile({ icon: Icon, tone = "primary" }: { icon: LucideIcon; tone?: "primary" | "secondary" | "success" | "warning" }) {
  const cls = {
    primary: "bg-primary/15 text-primary ring-primary/30",
    secondary: "bg-secondary/15 text-secondary ring-secondary/30",
    success: "bg-success/15 text-success ring-success/30",
    warning: "bg-warning/15 text-warning ring-warning/30",
  }[tone];
  return (
    <span className={`grid size-7 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${cls}`}>
      <Icon className="size-3.5" aria-hidden="true" />
    </span>
  );
}
