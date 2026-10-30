"use client";

import { useEffect, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Globe, PhoneCall, PhoneForwarded, Smartphone } from "lucide-react";
import {
  callsByHour,
  hours,
  languageMix,
  liveCallPool,
  liveLines,
  recentTransfers,
  today,
  topIntents,
  type Channel,
} from "@/config/demo-data";
import { Card } from "@/dashboard/ui";
import { useDashboard } from "@/dashboard/state";
import { ChartTooltip } from "@/dashboard/chart-bits";

const channelIcon: Record<Channel, typeof PhoneCall> = {
  "Phone call": PhoneCall,
  "Web call": Globe,
  "In-app (concept)": Smartphone,
};

const pct = (n: number, d: number) => (n / d) * 100;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type LineState = { call: (typeof liveCallPool)[number]; t: number; status: string; waiting: boolean };

/** Works out what each line is doing `elapsed` seconds after the page opened. */
function lineAt(line: (typeof liveLines)[number], index: number, elapsed: number): LineState {
  let k = line.first;
  let t = line.offset + elapsed;
  // Walk forward through the pool; each line takes every 4th call, plus a short gap between calls.
  for (let guard = 0; guard < 10000; guard++) {
    const len = liveCallPool[k % liveCallPool.length].length + 6;
    if (t < len) break;
    t -= len;
    k += liveLines.length;
  }
  const call = liveCallPool[k % liveCallPool.length];
  if (t >= call.length) return { call, t: call.length, status: "Wrapping up", waiting: false };
  const handover = call.transfers ? Math.round(call.length * 0.42) : Infinity;
  let status: string;
  if (t < 5) status = "Greeting";
  else if (t >= handover + 40) status = "With an agent";
  else if (t >= handover) status = "Waiting for agent";
  else if (t % 23 < 4) status = "Looking up account";
  else status = Math.floor((t + index * 3) / 7) % 2 === 0 ? "Listening" : "Lesedi speaking";
  return { call, t, status, waiting: status === "Waiting for agent" };
}

/** Seconds since mount, ticking once a second. */
function useElapsed() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function OverviewTab() {
  const { dispatch } = useDashboard();
  const elapsed = useElapsed();

  const resolvedPct = pct(today.resolved, today.calls);
  const transferredPct = pct(today.transferred, today.calls);
  const abandonedPct = pct(today.abandoned, today.calls);

  const kpis = [
    { label: "Calls today", value: today.calls.toLocaleString("en-GB"), was: today.prev.calls.toLocaleString("en-GB"), better: today.calls >= today.prev.calls },
    { label: "Resolved by Lesedi", value: fmtPct(resolvedPct), was: fmtPct(today.prev.resolvedPct), better: resolvedPct > today.prev.resolvedPct },
    { label: "Transferred to an agent", value: fmtPct(transferredPct), was: fmtPct(today.prev.transferredPct), better: transferredPct < today.prev.transferredPct },
    { label: "Average handle time", value: today.avgHandle, was: today.prev.avgHandle, better: true },
    { label: "Caller hung up", value: fmtPct(abandonedPct), was: fmtPct(today.prev.abandonedPct), better: abandonedPct < today.prev.abandonedPct },
  ];

  const chartData = hours.map((h, i) => ({
    label: `${h}:00`,
    today: callsByHour.today[i] ?? null,
    lastWeek: callsByHour.lastWeek[i],
  }));

  return (
    <div className="space-y-3">
      {/* KPI strip: one panel, cells divided by rules */}
      <section aria-label="Today's numbers" className="grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-surface @2xl:grid-cols-5">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={`px-3 py-2.5 ${i > 0 ? "@2xl:border-l" : ""} ${i % 2 === 1 ? "border-l @2xl:border-l" : ""} ${i >= 2 ? "border-t @2xl:border-t-0" : ""} border-line ${i === 4 ? "col-span-2 @2xl:col-span-1" : ""}`}
          >
            <p className="truncate text-[12px] text-muted">{k.label}</p>
            <p className="mt-0.5 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-fg tabular-nums">{k.value}</p>
            <p className="truncate text-[11.5px] text-muted tabular-nums">
              <span className={k.better ? "text-success" : "text-warning"}>{k.better ? "▲" : "▼"}</span> vs {k.was} last week
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Card
          title="Calls by hour"
          action={
            <span className="flex items-center gap-3 text-[11.5px] text-muted">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-[2px] bg-[var(--chart-resolved)]" aria-hidden="true" />Today</span>
              <span className="flex items-center gap-1.5"><span className="h-px w-3 border-t border-dashed border-fg" aria-hidden="true" />Same day last week</span>
            </span>
          }
        >
          <div className="h-[178px]" role="img" aria-label="Calls per hour today compared with the same day last week">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 6, right: 4, left: -26, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} interval={1} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in oklab, var(--text-primary) 5%, transparent)" }} />
                <Bar isAnimationActive={false} dataKey="today" name="Today" fill="var(--chart-resolved)" />
                <Line dataKey="lastWeek" name="Last week" stroke="var(--chart-transferred)" strokeDasharray="4 3" strokeWidth={1.4} dot={false} type="linear" isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              Live now
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
            </span>
          }
          action={<span className="text-[11.5px] tabular-nums text-muted">{liveLines.length} calls</span>}
          bodyClassName="!p-0"
        >
          <ul className="divide-y divide-line">
            {liveLines.map((line, i) => {
              const { call: c, t, status, waiting } = lineAt(line, i, elapsed);
              const Icon = channelIcon[c.channel];
              return (
                <li key={i} className="flex items-center gap-2.5 px-3 py-2">
                  <Icon className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] text-fg">{c.intent}</p>
                    <p className="truncate text-[11.5px] text-muted tabular-nums">
                      {c.caller} · {c.language}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12.5px] font-medium tabular-nums text-fg">{mmss(t)}</p>
                    <p className={`whitespace-nowrap text-[11.5px] ${waiting ? "text-warning" : "text-muted"}`}>{status}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Card
          title="Top reasons for calling today"
          action={
            <button type="button" onClick={() => dispatch({ type: "tab", tab: "conversations" })} className="text-[12px] text-muted hover:text-fg">
              View calls
            </button>
          }
          bodyClassName="!p-0"
        >
          <table className="w-full text-left text-[12.5px]">
            <caption className="sr-only">Top reasons for calling today, with how many Lesedi resolved</caption>
            <thead>
              <tr className="border-b border-line text-[11.5px] text-muted">
                <th scope="col" className="px-3 py-1.5 font-medium">Reason</th>
                <th scope="col" className="px-2 py-1.5 text-right font-medium">Calls</th>
                <th scope="col" className="px-2 py-1.5 font-medium">Resolved by Lesedi</th>
                <th scope="col" className="hidden px-3 py-1.5 text-right font-medium @xl:table-cell">Avg time</th>
              </tr>
            </thead>
            <tbody>
              {topIntents.map((t) => {
                const r = Math.round(pct(t.resolved, t.calls));
                return (
                  <tr key={t.name} className="border-b border-line last:border-0">
                    <td className="px-3 py-1.5">
                      <span className="text-fg">{t.name}</span>
                      {t.note && <span className="ml-1.5 text-[11.5px] text-muted">· {t.note}</span>}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-fg">{t.calls}</td>
                    <td className="px-2 py-1.5">
                      <span className="flex items-center gap-2">
                        <span className="h-1 w-16 rounded-full bg-fg/8" aria-hidden="true">
                          <span className="block h-full rounded-full bg-[var(--chart-resolved)]" style={{ width: `${r}%` }} />
                        </span>
                        <span className="tabular-nums text-muted">{r}%</span>
                      </span>
                    </td>
                    <td className="hidden px-3 py-1.5 text-right tabular-nums text-muted @xl:table-cell">{t.avgTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <div className="space-y-3">
          <Card title="Language">
            <div className="flex h-2 overflow-hidden rounded-sm" aria-hidden="true">
              {languageMix.map((l, i) => (
                <span
                  key={l.language}
                  style={{ width: `${l.share}%`, background: ["var(--chart-resolved)", "color-mix(in oklab, var(--chart-resolved) 45%, var(--surface))", "var(--chart-transferred)"][i] }}
                />
              ))}
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
              {languageMix.map((l) => (
                <div key={l.language}>
                  <dt className="text-muted">{l.language === "Mixed" ? "Code-switched" : l.language}</dt>
                  <dd className="text-[14px] font-semibold tabular-nums text-fg">{l.share}%</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card
            title="Recent transfers"
            action={<span className="text-[11.5px] tabular-nums text-muted">avg wait {today.avgWaitForAgent}</span>}
            bodyClassName="!p-0"
          >
            <ul className="divide-y divide-line">
              {recentTransfers.map((t) => (
                <li key={t.ref} className="flex gap-2.5 px-3 py-2">
                  <PhoneForwarded className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] text-fg">{t.reason}</p>
                    <p className="truncate text-[11.5px] text-muted">
                      {t.intent} → {t.to}
                    </p>
                  </div>
                  <span className="text-[11.5px] tabular-nums text-muted">{t.time}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
