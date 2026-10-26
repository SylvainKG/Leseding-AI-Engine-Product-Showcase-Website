"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  MessagesSquare,
  PhoneCall,
  Sparkles,
  UserRoundCheck,
  Bot,
} from "lucide-react";
import { analytics, channelSummary, overviewKpis, recentActivity } from "@/config/demo-data";
import { Badge, Card, DemoTag, IconTile, statusTone } from "@/dashboard/ui";
import { useDashboard } from "@/dashboard/state";
import { ChartTooltip } from "@/dashboard/chart-bits";

const kpiIcons = {
  conversations: MessagesSquare,
  "ai-handled": Sparkles,
  escalated: UserRoundCheck,
  response: Clock3,
};

export function OverviewTab() {
  const { state, dispatch } = useDashboard();
  const agent = state.agent.saved;
  const data = analytics["7d"].volume;

  return (
    <div className="space-y-3">
      {/* Agent strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3">
        <span
          className="grid size-10 place-items-center rounded-full text-primary-contrast"
          style={{ background: "radial-gradient(circle at 35% 30%, var(--primary-hover), var(--brand-primary) 70%)" }}
        >
          <Bot className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-[min(100%,14rem)] flex-1">
          <p className="text-[13px] font-semibold text-fg">
            {agent.name} <span className="font-normal text-muted">· voice support agent</span>
          </p>
          <p className="truncate text-[11px] text-muted">
            {agent.languages.join(" + ")} · {agent.hoursMode === "24/7" ? "Available 24/7" : `${agent.hoursFrom}–${agent.hoursTo}`} · Handoff:{" "}
            {agent.handoff.toLowerCase()}
          </p>
        </div>
        <Badge tone={agent.active ? "success" : "muted"}>{agent.active ? "Demo active" : "Paused"}</Badge>
        <button
          type="button"
          onClick={() => dispatch({ type: "tab", tab: "agent" })}
          className="text-[11.5px] font-medium text-primary hover:underline"
        >
          Configure
        </button>
      </div>

      {/* KPIs */}
      <div>
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
        {overviewKpis.map((k) => {
          const Icon = kpiIcons[k.id as keyof typeof kpiIcons];
          // For escalations and response time, "down" is good.
          const good = k.id === "escalated" || k.id === "response" ? k.trend === "down" : k.trend === "up";
          const Arrow = k.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={k.id} className="rounded-xl border border-line bg-surface p-3">
              <div className="flex items-center gap-2">
                <IconTile icon={Icon} />
                <p className="truncate text-[11px] text-muted">{k.label}</p>
              </div>
              <p className="mt-2 font-display text-[20px] font-bold tracking-tight text-fg tabular-nums">{k.value}</p>
              <p className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-[10.5px]">
                <span className={`flex items-center gap-0.5 font-medium ${good ? "text-success" : "text-warning"}`}>
                  <Arrow className="size-3" aria-hidden="true" />
                  {k.delta}
                </span>
                <span className="truncate text-muted">vs last week</span>
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-[10px] text-muted">Sample figures for demonstration — not pilot results.</p>
      </div>

      <div className="grid gap-3 @2xl:grid-cols-3">
        <Card title="Conversation activity" action={<DemoTag>Illustrative</DemoTag>} className="@2xl:col-span-2">
          <div className="h-[150px]" role="img" aria-label="Illustrative area chart of AI-handled and escalated conversations over the last 7 days">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="ov-ai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
                <Area type="monotone" dataKey="ai" name="AI-handled" stroke="var(--brand-primary)" strokeWidth={2} fill="url(#ov-ai)" />
                <Area type="monotone" dataKey="escalated" name="Escalated" stroke="var(--brand-secondary)" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-[10.5px] text-muted">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-primary" aria-hidden="true" />AI-handled</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-secondary" aria-hidden="true" />Escalated</span>
          </div>
        </Card>

        <Card title="Channels" action={<DemoTag>Sample</DemoTag>}>
          <ul className="space-y-3">
            {channelSummary.map((c) => (
              <li key={c.channel}>
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-fg">{c.channel}</span>
                  <span className="tabular-nums text-muted">{c.share}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${c.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10.5px] text-muted">In-app channel is shown as a concept.</p>
        </Card>
      </div>

      <div className="grid gap-3 @2xl:grid-cols-2">
        <Card
          title="Recent activity"
          action={
            <button type="button" onClick={() => dispatch({ type: "tab", tab: "conversations" })} className="text-[11px] font-medium text-primary hover:underline">
              View all
            </button>
          }
        >
          <ul className="divide-y divide-line">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
                <IconTile icon={a.status === "Updated" ? BookOpen : a.status === "Escalated" ? UserRoundCheck : CheckCircle2} tone={a.status === "Escalated" ? "warning" : "success"} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-fg">{a.title}</p>
                  <p className="truncate text-[10.5px] text-muted">{a.meta}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={statusTone(a.status)} icon={false}>{a.status}</Badge>
                  <span className="text-[10px] text-muted">{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="How the agent handles a call">
          <ol className="grid grid-cols-2 gap-2.5 @md:grid-cols-4 @2xl:grid-cols-2 @4xl:grid-cols-4">
            {[
              { icon: PhoneCall, t: "Customer speaks", d: "By phone, web or app" },
              { icon: Brain, t: "Understands", d: "Intent & language" },
              { icon: BookOpen, t: "Looks it up", d: "In your knowledge base" },
              { icon: CheckCircle2, t: "Answers or hands off", d: "To your team when needed" },
            ].map((s, i) => (
              <li key={s.t} className="rounded-lg border border-line bg-sunken p-2.5">
                <IconTile icon={s.icon} tone={i === 3 ? "success" : "primary"} />
                <p className="mt-2 text-[11.5px] font-semibold text-fg">
                  <span className="text-muted">{i + 1}. </span>
                  {s.t}
                </p>
                <p className="text-[10.5px] text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
