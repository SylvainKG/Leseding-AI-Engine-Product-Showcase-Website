"use client";

import { forwardRef, useId } from "react";
import { Search, type LucideIcon } from "lucide-react";

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
    <section className={`rounded-lg border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex min-h-9 items-center justify-between gap-2 border-b border-line px-3 py-1.5">
          {title && <h3 className="text-[13px] font-semibold text-fg">{title}</h3>}
          {action}
        </header>
      )}
      <div className={`p-3 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

type Tone = "success" | "warning" | "primary" | "muted" | "danger";

const toneText: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  primary: "text-primary",
  muted: "text-muted",
  danger: "text-danger",
};

const toneDot: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  primary: "bg-primary",
  muted: "bg-muted",
  danger: "bg-danger",
};

/** Status label: a coloured dot plus text, so meaning never relies on colour alone. */
export function Badge({ tone, children, icon = true }: { tone: Tone; children: React.ReactNode; icon?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium ${tone === "muted" ? "text-muted" : "text-fg"}`}>
      {icon && <span className={`size-1.5 shrink-0 rounded-full ${toneDot[tone]}`} aria-hidden="true" />}
      <span className={icon ? "" : toneText[tone]}>{children}</span>
    </span>
  );
}

export function statusTone(status: string): Tone {
  if (["Resolved", "Resolved by Lesedi", "Published", "Completed", "Updated"].includes(status)) return "success";
  if (["Transferred", "Escalated", "Needs review"].includes(status)) return "warning";
  if (["Abandoned"].includes(status)) return "danger";
  if (["In progress"].includes(status)) return "primary";
  return "muted";
}

export function DemoTag({ children = "Demo data" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-line px-1.5 py-px text-[11px] font-medium text-muted">
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
    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45";
  const sizes = size === "sm" ? "h-7 px-2.5 text-[13px]" : "h-10 px-4 text-sm";
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
      <label htmlFor={htmlFor} className="block text-[12.5px] font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-muted">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-sunken px-2.5 py-1.5 text-[13.5px] text-fg placeholder:text-muted/70 outline-none transition-colors hover:border-line-strong focus:border-primary focus-visible:outline-none focus:ring-1 focus:ring-primary/40";

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
        <p id={id} className="text-[13px] font-medium text-fg">
          {label}
        </p>
        {description && <p className="text-[11.5px] text-muted">{description}</p>}
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
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
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
      <p className="mt-3 text-[13.5px] font-semibold text-fg">{title}</p>
      <p className="mt-1 max-w-xs text-[12.5px] text-muted">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function IconTile({ icon: Icon, tone = "primary" }: { icon: LucideIcon; tone?: "primary" | "secondary" | "success" | "warning" }) {
  const cls = {
    primary: "bg-fg/6 text-muted",
    secondary: "bg-fg/6 text-secondary",
    success: "bg-fg/6 text-success",
    warning: "bg-fg/6 text-warning",
  }[tone];
  return (
    <span className={`grid size-6 shrink-0 place-items-center rounded-md ${cls}`}>
      <Icon className="size-3.5" aria-hidden="true" />
    </span>
  );
}
