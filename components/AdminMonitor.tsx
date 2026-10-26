"use client";

import { useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  Info,
  LayoutDashboard,
  MessagesSquare,
  RotateCcw,
} from "lucide-react";
import { LogoMark } from "@/components/Brand";
import { useShowcaseView } from "@/components/ShowcaseProvider";
import { DashboardProvider, useDashboard, type TabId } from "@/dashboard/state";
import { Button } from "@/dashboard/ui";
import { OverviewTab } from "@/dashboard/OverviewTab";
import { AgentTab } from "@/dashboard/AgentTab";
import { KnowledgeBaseTab } from "@/dashboard/KnowledgeBaseTab";
import { ConversationsTab } from "@/dashboard/ConversationsTab";
import { AnalyticsTab } from "@/dashboard/AnalyticsTab";
import { SettingsTab } from "@/dashboard/SettingsTab";

const tabs: Array<{ id: TabId; label: string; icon: typeof Bot; title: string; sub: string }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, title: "Overview", sub: "Support activity at a glance" },
  { id: "agent", label: "AI Agent", icon: Bot, title: "AI Agent", sub: "Shape how your agent greets and answers" },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen, title: "Knowledge Base", sub: "What the agent can draw on" },
  { id: "conversations", label: "Conversations", icon: MessagesSquare, title: "Conversations", sub: "Review calls and transcripts" },
  { id: "analytics", label: "Analytics", icon: BarChart3, title: "Analytics", sub: "Trends across channels and topics" },
  { id: "settings", label: "Organisation Settings", icon: Building2, title: "Organisation Settings", sub: "Brand, channels and handoff" },
];

const panels: Record<TabId, () => React.ReactNode> = {
  overview: OverviewTab,
  agent: AgentTab,
  knowledge: KnowledgeBaseTab,
  conversations: ConversationsTab,
  analytics: AnalyticsTab,
  settings: SettingsTab,
};

/** Desktop monitor frame (CSS-built) holding the simulated dashboard. */
export function AdminMonitor() {
  const { config } = useShowcaseView();
  return (
    <div className="w-full">
      <div
        className="rounded-[18px] bg-bezel p-2 ring-1 ring-line-strong sm:p-2.5"
        style={{
          boxShadow:
            "0 50px 90px -40px color-mix(in oklab, var(--brand-primary) 40%, transparent), 0 24px 50px -24px rgb(0 0 0 / 0.65), inset 0 0 0 1.5px color-mix(in oklab, var(--text-primary) 8%, transparent)",
        }}
      >
        <div className="@container overflow-hidden rounded-[10px] bg-page ring-1 ring-line">
          <DashboardProvider orgName={config.dashboard.organisationName}>
            <Dashboard />
          </DashboardProvider>
        </div>
        <div className="mt-1.5 flex justify-center" aria-hidden="true">
          <span className="size-1 rounded-full bg-line-strong" />
        </div>
      </div>
      {/* stand */}
      <div className="flex flex-col items-center" aria-hidden="true">
        <div
          className="h-10 w-[18%] min-w-16 sm:h-14"
          style={{ background: "linear-gradient(180deg, var(--device-bezel), color-mix(in oklab, var(--device-bezel) 70%, var(--border-strong)))", clipPath: "polygon(12% 0, 88% 0, 100% 100%, 0 100%)" }}
        />
        <div className="h-2 w-[34%] min-w-28 rounded-t-md rounded-b-xl bg-bezel ring-1 ring-line" />
      </div>
    </div>
  );
}

function Dashboard() {
  const { state, dispatch, resetDemo } = useDashboard();
  const { config, preview } = useShowcaseView();
  const reduce = useReducedMotion();
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const active = tabs.find((t) => t.id === state.tab)!;
  const Panel = panels[state.tab];

  const onKey = (e: React.KeyboardEvent) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === state.tab);
    let n = i;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % tabs.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = tabs.length - 1;
    dispatch({ type: "tab", tab: tabs[n].id });
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[n]?.focus();
  };

  return (
    <div className="relative flex h-[640px] flex-col @xl:aspect-[16/10] @xl:h-auto @xl:flex-row">
      {/* Sidebar (wide) / tab strip (narrow) */}
      <nav
        aria-label="Dashboard sections"
        className="flex shrink-0 flex-col border-b border-line bg-surface @xl:w-[148px] @xl:border-b-0 @xl:border-r @3xl:w-[180px] @4xl:w-[200px]"
      >
        <div className="hidden items-center gap-2 px-3.5 pb-2 pt-4 @xl:flex">
          <LogoMark className="size-7" />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold leading-tight text-fg">Leseding</p>
            <p className="truncate text-[10px] text-muted">{state.org.saved.orgName}</p>
          </div>
        </div>
        <div
          ref={listRef}
          role="tablist"
          aria-orientation="vertical"
          aria-label="Dashboard sections"
          onKeyDown={onKey}
          className="scroll-thin flex gap-1 overflow-x-auto px-2 py-2 @xl:flex-col @xl:overflow-visible @xl:px-2 @xl:pt-3"
        >
          {tabs.map((t) => {
            const on = t.id === state.tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${t.id}`}
                aria-selected={on}
                aria-controls={`${baseId}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => dispatch({ type: "tab", tab: t.id })}
                className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors ${
                  on ? "bg-primary/14 text-fg" : "text-muted hover:bg-fg/5 hover:text-fg"
                }`}
              >
                {on && <span className="absolute inset-y-1.5 left-0 hidden w-[3px] rounded-full bg-primary @xl:block" aria-hidden="true" />}
                <t.icon className={`size-4 shrink-0 ${on ? "text-primary" : ""}`} aria-hidden="true" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-auto hidden p-2.5 @xl:block">
          <div className="rounded-lg border border-line bg-sunken p-2.5">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-fg">
              <span className="size-1.5 rounded-full bg-secondary animate-pulse-soft" aria-hidden="true" />
              Demo mode
            </p>
            <p className="mt-0.5 text-[10px] leading-snug text-muted">Simulated controls. Nothing here changes a live system.</p>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line px-3 py-2.5 @md:px-4">
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-2 truncate text-[14px] font-bold text-fg">
              {active.title}
              <span className="rounded-md border border-dashed border-line-strong px-1.5 py-0.5 text-[9.5px] font-medium text-muted">
                {config.dashboard.demoLabel}
              </span>
            </h3>
            <p className="hidden truncate text-[11px] text-muted @lg:block">{active.sub}</p>
          </div>
          <Button onClick={resetDemo} aria-label="Reset demo to default data and settings" title="Reset demo">
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span className="hidden @md:inline">Reset demo</span>
          </Button>
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${state.tab}`}
          tabIndex={0}
          className="@container scroll-thin min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-3 focus-visible:outline-offset-[-2px] @md:px-4"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${state.tab}-${state.epoch}`}
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Toast / live region */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-50 flex justify-center px-3" role="status" aria-live="polite">
        <AnimatePresence>
          {state.toast && !preview && (
            <motion.div
              key={state.toast.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex max-w-md items-center gap-2 rounded-xl border border-line-strong bg-raised px-3 py-2 text-[11.5px] text-fg shadow-2xl"
            >
              {state.toast.tone === "success" ? (
                <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
              )}
              {state.toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
