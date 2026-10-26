"use client";

import { useEffect, useRef, useState } from "react";
import { ConfigView } from "@/components/ShowcaseProvider";
import { ShowcaseLayout } from "@/components/ShowcaseLayout";
import type { ShowcaseConfig } from "@/config/showcase-config";
import { themeToStyle } from "@/lib/theme";

const DESIGN_WIDTH = 1440;

/** A scaled, non-interactive render of the real showcase using the draft config. */
export function LivePreview({ config, localImages }: { config: ShowcaseConfig; localImages: Record<string, string> }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [height, setHeight] = useState(500);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const ro = new ResizeObserver(() => {
      const s = o.clientWidth / DESIGN_WIDTH;
      setScale(s);
      setHeight(i.offsetHeight * s);
    });
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="relative overflow-hidden rounded-xl border border-line-strong" style={{ height }}>
      <div
        ref={inner}
        inert
        aria-hidden="true"
        className="theme-scope pointer-events-none absolute left-0 top-0 origin-top-left select-none"
        style={{ width: DESIGN_WIDTH, transform: `scale(${scale})`, ...themeToStyle(config.theme), background: "var(--page-background)", color: "var(--text-primary)" }}
      >
        <ConfigView value={{ config, localImages, preview: true }}>
          <ShowcaseLayout />
        </ConfigView>
      </div>
    </div>
  );
}

/** Readable-size samples of interactive states using the draft theme. */
export function StateSamples({ config }: { config: ShowcaseConfig }) {
  return (
    <div className="theme-scope rounded-xl border border-line-strong p-4" style={{ ...themeToStyle(config.theme), background: "var(--page-background)", color: "var(--text-primary)" }}>
      <div className="rounded-lg border border-line bg-surface p-3.5">
        <p className="text-[13px] font-semibold text-fg">Panel heading</p>
        <p className="text-[12px] text-muted">Muted supporting text on a panel.</p>
        <div className="mt-3 flex flex-wrap gap-2" aria-hidden="true">
          <span className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-contrast">Primary</span>
          <span className="rounded-lg bg-primary-hover px-3 py-1.5 text-[12px] font-medium text-primary-contrast">Hover</span>
          <span className="rounded-lg bg-primary-active px-3 py-1.5 text-[12px] font-medium text-primary-contrast">Active</span>
          <span className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-contrast opacity-45">Disabled</span>
          <span className="rounded-lg border border-line bg-raised px-3 py-1.5 text-[12px] font-medium text-fg">Secondary</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-hidden="true">
          <span className="rounded-lg bg-primary/14 px-2.5 py-1 text-[12px] font-medium text-fg ring-1 ring-inset ring-primary/30">Selected tab</span>
          <span className="rounded-lg px-2.5 py-1 text-[12px] font-medium text-muted">Tab</span>
          <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success ring-1 ring-inset ring-success/25">Resolved</span>
          <span className="rounded-full bg-warning/12 px-2 py-0.5 text-[11px] font-medium text-warning ring-1 ring-inset ring-warning/25">Escalated</span>
          <span className="rounded-full bg-secondary/12 px-2 py-0.5 text-[11px] font-medium text-secondary ring-1 ring-inset ring-secondary/30">Secondary</span>
        </div>
      </div>
    </div>
  );
}
