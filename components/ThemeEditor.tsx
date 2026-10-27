"use client";

import { useId } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ThemeConfig } from "@/config/showcase-config";
import { contrastChecks, contrastRatio, normalizeHex } from "@/lib/config-validation";

export const themeFields: Array<{ key: keyof ThemeConfig; label: string; hint: string }> = [
  { key: "primary", label: "Primary", hint: "Key accents, active states, buttons" },
  { key: "primaryContrast", label: "Primary contrast", hint: "Text and icons on primary" },
  { key: "secondary", label: "Secondary", hint: "Supporting accent" },
  { key: "background", label: "Page background", hint: "Main page background" },
  { key: "surface", label: "Panel / surface", hint: "Cards, panels, monitor interior" },
  { key: "sectionCard", label: "Section cards", hint: "The two main landing-page cards" },
  { key: "sectionCardText", label: "Section card text", hint: "Headings and labels on section cards" },
  { key: "text", label: "Text", hint: "Primary body text" },
  { key: "mutedText", label: "Muted text", hint: "Secondary labels" },
  { key: "border", label: "Border", hint: "Dividers and outlines" },
  { key: "success", label: "Success", hint: "Success states" },
  { key: "warning", label: "Warning", hint: "Warning states" },
];

export type HexInputs = Record<keyof ThemeConfig, string>;

export function ThemeEditor({
  theme,
  inputs,
  onInput,
}: {
  theme: ThemeConfig;
  inputs: HexInputs;
  onInput: (key: keyof ThemeConfig, raw: string) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {themeFields.map((f) => {
          const raw = inputs[f.key];
          const valid = normalizeHex(raw) !== null;
          const errId = `${id}-${f.key}-err`;
          return (
            <div key={f.key} className="rounded-xl border border-line bg-surface p-3">
              <label htmlFor={`${id}-${f.key}`} className="block text-[13px] font-medium text-fg">
                {f.label}
              </label>
              <p className="text-[11.5px] text-muted">{f.hint}</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={theme[f.key].toLowerCase()}
                  onChange={(e) => onInput(f.key, e.target.value.toUpperCase())}
                  aria-label={`${f.label} colour picker`}
                  className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
                />
                <input
                  id={`${id}-${f.key}`}
                  value={raw}
                  onChange={(e) => onInput(f.key, e.target.value)}
                  spellCheck={false}
                  maxLength={7}
                  aria-invalid={!valid}
                  aria-describedby={valid ? undefined : errId}
                  className={`h-9 w-full rounded-lg border bg-sunken px-2.5 font-mono text-[13px] uppercase text-fg outline-none focus:ring-2 ${
                    valid ? "border-line focus:border-primary focus:ring-primary/30" : "border-danger focus:ring-danger/30"
                  }`}
                />
              </div>
              {!valid && (
                <p id={errId} className="mt-1.5 text-[11.5px] text-danger">
                  Enter a hex colour like #3D6BF5 or #36F.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <h3 className="text-[13px] font-semibold text-fg">Contrast checks</h3>
        <p className="text-[11.5px] text-muted">WCAG guidance: 4.5:1 for body text, 3:1 for large text and accents.</p>
        <ul className="mt-3 space-y-2">
          {contrastChecks.map((c) => {
            const ratio = contrastRatio(theme[c.fg], theme[c.bg]);
            const ok = ratio >= c.min;
            return (
              <li key={c.id} className="flex items-center gap-3 text-[12.5px]">
                <span
                  className="grid h-7 w-10 shrink-0 place-items-center rounded-md text-[11px] font-bold ring-1 ring-line"
                  style={{ background: theme[c.bg], color: theme[c.fg] }}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <span className="flex-1 text-fg">{c.label}</span>
                <span className="tabular-nums text-muted">{ratio.toFixed(1)}:1</span>
                <span className={`flex w-24 items-center justify-end gap-1 text-[11.5px] font-medium ${ok ? "text-success" : "text-warning"}`}>
                  {ok ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <AlertTriangle className="size-3.5" aria-hidden="true" />}
                  {ok ? "Passes" : `Below ${c.min}:1`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
