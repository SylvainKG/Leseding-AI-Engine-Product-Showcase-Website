"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analytics, heatmap, hours, ranges, type RangeKey } from "@/config/demo-data";
import { Card } from "@/dashboard/ui";
import { ChartTooltip } from "@/dashboard/chart-bits";

const axis = { tickLine: false, axisLine: false, tick: { fill: "var(--text-muted)", fontSize: 11 } } as const;
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const langColor = ["var(--chart-resolved)", "color-mix(in oklab, var(--chart-resolved) 45%, var(--surface))", "var(--chart-transferred)"];

export function AnalyticsTab() {
  const [range, setRange] = useState<RangeKey>("30d");
  const d = analytics[range];
  const t = d.totals;
  const resolvedPct = (t.resolved / t.total) * 100;
  const delta = resolvedPct - d.prevResolvedPct;
  const rateSeries = d.series.map((p) => ({ label: p.label, rate: +((p.resolved / p.total) * 100).toFixed(1) }));
  const heatMax = Math.max(...heatmap.flat());
  const tickEvery = range === "30d" ? 4 : 0;

  const kpis = [
    { l: "Calls", v: t.total.toLocaleString("en-GB"), s: `${Math.round(t.total / d.series.length).toLocaleString("en-GB")} a ${range === "90d" ? "week" : "day"} on average` },
    { l: "Resolved by Lesedi", v: `${resolvedPct.toFixed(1)}%`, s: `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)} pts on the previous ${ranges.find((r) => r.key === range)!.label}`, good: delta >= 0 },
    { l: "Transferred", v: `${((t.transferred / t.total) * 100).toFixed(1)}%`, s: `${t.transferred.toLocaleString("en-GB")} calls` },
    { l: "Average handle time", v: d.avgHandle, s: "Lesedi-only calls" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="radiogroup" aria-label="Date range" className="inline-flex rounded-md border border-line bg-surface p-0.5">
          {ranges.map((r) => (
            <button
              key={r.key}
              type="button"
              role="radio"
              aria-checked={range === r.key}
              onClick={() => setRange(r.key)}
              className={`rounded px-2.5 py-0.5 text-[12.5px] transition-colors ${range === r.key ? "bg-fg font-medium text-surface" : "text-muted hover:text-fg"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="text-[11.5px] text-muted">All channels · Africa/Gaborone time</p>
      </div>

      <section aria-label="Totals for the selected range" className="grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-surface @2xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.l} className={`border-line px-3 py-2.5 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t @2xl:border-t-0" : ""} ${i === 2 ? "@2xl:border-l" : ""}`}>
            <p className="truncate text-[12px] text-muted">{k.l}</p>
            <p className="mt-0.5 text-[24px] font-semibold leading-tight tracking-[-0.02em] tabular-nums text-fg">{k.v}</p>
            <p className={`truncate text-[11.5px] tabular-nums ${k.good === undefined ? "text-muted" : k.good ? "text-success" : "text-warning"}`}>{k.s}</p>
          </div>
        ))}
      </section>

      <Card
        title="Calls by outcome"
        action={
          <span className="flex items-center gap-3 text-[11.5px] text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-[2px] bg-[var(--chart-resolved)]" aria-hidden="true" />Resolved by Lesedi</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-[2px] bg-[var(--chart-transferred)]" aria-hidden="true" />Transferred</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-[2px] bg-[var(--chart-abandoned)]" aria-hidden="true" />Hung up</span>
          </span>
        }
      >
        <div className="h-[200px]" role="img" aria-label={`Calls per ${range === "90d" ? "week" : "day"} split by outcome`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.series} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barCategoryGap={range === "30d" ? "18%" : "30%"}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" {...axis} interval={tickEvery} />
              <YAxis {...axis} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in oklab, var(--text-primary) 5%, transparent)" }} />
              <Bar isAnimationActive={false} dataKey="resolved" name="Resolved by Lesedi" stackId="a" fill="var(--chart-resolved)" />
              <Bar isAnimationActive={false} dataKey="transferred" name="Transferred" stackId="a" fill="var(--chart-transferred)" />
              <Bar isAnimationActive={false} dataKey="abandoned" name="Hung up" stackId="a" fill="var(--chart-abandoned)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card title="When people call" action={<span className="text-[11.5px] text-muted">Average calls per hour</span>}>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full border-separate border-spacing-[2px] text-[11px]" aria-label="Average calls by weekday and hour">
              <thead>
                <tr>
                  <th scope="col" className="w-8" />
                  {hours.map((h, i) => (
                    <th key={h} scope="col" className="font-normal tabular-nums text-muted">
                      {i % 2 === 0 ? h : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row, r) => (
                  <tr key={weekdays[r]}>
                    <th scope="row" className="pr-1 text-left font-normal text-muted">{weekdays[r]}</th>
                    {row.map((v, c) => (
                      <td
                        key={c}
                        title={`${weekdays[r]} ${hours[c]}:00 · ${v} calls`}
                        className="h-[22px] min-w-3 rounded-[2px]"
                        style={{ background: `color-mix(in oklab, #2b6ca3 ${Math.round(Math.pow(v / heatMax, 1.3) * 100)}%, #eef2f6)` }}
                      >
                        <span className="sr-only">{v}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11.5px] text-muted">Busiest 09:00–10:00 on Mondays. Saturdays and Sundays are about half as busy.</p>
        </Card>

        <div className="space-y-3">
          <Card title="Resolved by Lesedi, % of calls">
            <div className="h-[118px]" role="img" aria-label="Share of calls resolved by Lesedi over the selected range">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rateSeries} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="label" {...axis} interval={range === "30d" ? 6 : range === "90d" ? 3 : 0} />
                  <YAxis {...axis} domain={[40, 70]} ticks={[40, 55, 70]} />
                  <Tooltip content={<ChartTooltip unit="%" />} cursor={{ stroke: "var(--border-strong)" }} />
                  <Line dataKey="rate" name="Resolved" stroke="var(--chart-transferred)" strokeWidth={1.75} dot={false} type="linear" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Language">
            <div className="flex h-2 overflow-hidden rounded-sm" aria-hidden="true">
              {d.languages.map((l, i) => (
                <span key={l.language} style={{ width: `${l.share}%`, background: langColor[i] }} />
              ))}
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
              {d.languages.map((l) => (
                <div key={l.language}>
                  <dt className="text-muted">{l.language === "Mixed" ? "Code-switched" : l.language}</dt>
                  <dd className="text-[14px] font-semibold tabular-nums text-fg">{l.share}%</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
