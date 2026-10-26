"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analytics, ranges, type RangeKey } from "@/config/demo-data";
import { Card, DemoTag } from "@/dashboard/ui";
import { ChartTooltip } from "@/dashboard/chart-bits";

const axis = { tickLine: false, axisLine: false, tick: { fill: "var(--text-muted)", fontSize: 10 } } as const;

export function AnalyticsTab() {
  const [range, setRange] = useState<RangeKey>("7d");
  const d = analytics[range];
  const totalCat = d.categories.reduce((a, c) => a + c.count, 0);
  const escalated = d.volume.reduce((a, v) => a + v.escalated, 0);
  const ai = d.volume.reduce((a, v) => a + v.ai, 0);
  const aiPct = Math.round((ai / (ai + escalated)) * 100);
  const rangeLabel = ranges.find((r) => r.key === range)!.label.toLowerCase();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="radiogroup" aria-label="Date range" className="inline-flex rounded-lg border border-line bg-sunken p-0.5">
          {ranges.map((r) => (
            <button
              key={r.key}
              type="button"
              role="radio"
              aria-checked={range === r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                range === r.key ? "bg-primary text-primary-contrast" : "text-muted hover:text-fg"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <DemoTag>All figures illustrative — not live telemetry</DemoTag>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Conversations", v: d.totals.conversations.toLocaleString("en-GB") },
          { l: "AI-handled share", v: `${aiPct}%` },
          { l: "Avg. resolution", v: d.totals.avgResolution },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-line bg-surface p-3">
            <p className="text-[10.5px] text-muted">{s.l}</p>
            <p className="mt-1 font-display text-[18px] font-bold tabular-nums text-fg">{s.v}</p>
            <p className="text-[10px] text-muted">{rangeLabel} · sample</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 @2xl:grid-cols-5">
        <Card title="Conversation volume" className="@2xl:col-span-3">
          <div className="h-[160px]" role="img" aria-label={`Illustrative stacked bar chart of conversation volume, ${rangeLabel}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.volume} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barCategoryGap={range === "30d" ? 2 : "22%"}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                <XAxis dataKey="label" {...axis} interval={range === "30d" ? 4 : 0} />
                <YAxis {...axis} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in oklab, var(--text-primary) 6%, transparent)" }} />
                <Bar dataKey="ai" name="AI-handled" stackId="a" fill="var(--brand-primary)" />
                <Bar dataKey="escalated" name="Escalated" stackId="a" fill="var(--brand-secondary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-[10.5px] text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary" aria-hidden="true" />AI-handled ({ai.toLocaleString("en-GB")})</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-secondary" aria-hidden="true" />Escalated ({escalated.toLocaleString("en-GB")})</span>
          </div>
        </Card>

        <Card title="Common enquiry categories" className="@2xl:col-span-2">
          <ul className="space-y-2.5">
            {d.categories.map((c) => {
              const pct = Math.round((c.count / totalCat) * 100);
              return (
                <li key={c.name}>
                  <div className="flex justify-between gap-2 text-[11px]">
                    <span className="truncate text-fg">{c.name}</span>
                    <span className="shrink-0 tabular-nums text-muted">{pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-line" aria-hidden="true">
                    <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-3 @2xl:grid-cols-5">
        <Card title="AI-handled vs escalated" className="@2xl:col-span-2">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 36 36" className="size-24 shrink-0 -rotate-90" role="img" aria-label={`${aiPct}% AI-handled, ${100 - aiPct}% escalated (illustrative)`}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--brand-secondary)" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" stroke="var(--brand-primary)" strokeWidth="4"
                strokeDasharray={`${aiPct} ${100 - aiPct}`} pathLength={100}
                className="transition-[stroke-dasharray] duration-500"
              />
            </svg>
            <dl className="space-y-2 text-[11.5px]">
              <div><dt className="flex items-center gap-1.5 text-muted"><span className="size-2 rounded-full bg-primary" aria-hidden="true" />AI-handled</dt><dd className="font-display text-[16px] font-bold text-fg">{aiPct}%</dd></div>
              <div><dt className="flex items-center gap-1.5 text-muted"><span className="size-2 rounded-full bg-secondary" aria-hidden="true" />Escalated</dt><dd className="font-display text-[16px] font-bold text-fg">{100 - aiPct}%</dd></div>
            </dl>
          </div>
        </Card>
        <Card title="Average resolution time (minutes)" className="@2xl:col-span-3">
          <div className="h-[110px]" role="img" aria-label={`Illustrative line chart of average resolution time, ${rangeLabel}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.resolution} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                <XAxis dataKey="label" {...axis} interval={range === "30d" ? 4 : 0} />
                <YAxis {...axis} domain={["dataMin - 0.5", "dataMax + 0.5"]} tickFormatter={(v: number) => v.toFixed(1)} />
                <Tooltip content={<ChartTooltip unit=" min" />} cursor={{ stroke: "var(--border-strong)" }} />
                <Line type="monotone" dataKey="minutes" name="Resolution" stroke="var(--success)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
