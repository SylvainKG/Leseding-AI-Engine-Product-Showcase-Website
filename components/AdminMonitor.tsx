"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  ChevronsUpDown,
  FlaskConical,
  Info,
  LayoutDashboard,
  MessagesSquare,
  RotateCcw,
} from "lucide-react";
import { useShowcaseView } from "@/components/ShowcaseProvider";
import { DashboardProvider, useDashboard, type TabId } from "@/dashboard/state";
import { Button } from "@/dashboard/ui";
import { usage } from "@/config/demo-data";
import { OverviewTab } from "@/dashboard/OverviewTab";
import { AgentTab } from "@/dashboard/AgentTab";
import { KnowledgeBaseTab } from "@/dashboard/KnowledgeBaseTab";
import { ConversationsTab } from "@/dashboard/ConversationsTab";
import { AnalyticsTab } from "@/dashboard/AnalyticsTab";
import { SettingsTab } from "@/dashboard/SettingsTab";

const tabs: Array<{ id: TabId; short: string; label: string; icon: typeof Bot; group: "Monitor" | "Configure"; sub: string }> = [
  { id: "overview", short: "Overview", label: "Overview", icon: LayoutDashboard, group: "Monitor", sub: "Today so far" },
  { id: "conversations", short: "Calls", label: "Conversations", icon: MessagesSquare, group: "Monitor", sub: "Calls and transcripts" },
  { id: "analytics", short: "Analytics", label: "Analytics", icon: BarChart3, group: "Monitor", sub: "Trends over time" },
  { id: "agent", short: "Agent", label: "AI agent", icon: Bot, group: "Configure", sub: "Voice, languages and handoff" },
  { id: "knowledge", short: "Knowledge", label: "Knowledge base", icon: BookOpen, group: "Configure", sub: "What Lesedi can answer from" },
  { id: "settings", short: "Settings", label: "Settings", icon: Building2, group: "Configure", sub: "Organisation, channels and team" },
];

const panels: Record<TabId, () => React.ReactNode> = {
  overview: OverviewTab,
  agent: AgentTab,
  knowledge: KnowledgeBaseTab,
  conversations: ConversationsTab,
  analytics: AnalyticsTab,
  settings: SettingsTab,
};

const KIOSK_QUERY = "(min-width: 1024px) and (min-height: 600px)";

/** True when the page is in single-screen (kiosk) layout. */
export function useKiosk() {
  const { preview } = useShowcaseView();
  const [kiosk, setKiosk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(KIOSK_QUERY);
    const on = () => setKiosk(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return kiosk && !preview;
}

/**
 * Desktop monitor holding the simulated console. The console is shown at its
 * real size (no shrinking): in kiosk layout the monitor fills its panel and the
 * console reflows to fit; anything taller than the screen scrolls inside it.
 */
export function AdminMonitor({ label }: { label?: string }) {
  const { config } = useShowcaseView();
  const kiosk = useKiosk();

  return (
    <div className={`flex w-full flex-col ${kiosk ? "h-full min-h-0" : ""}`}>
      <div
        className={`flex flex-col rounded-[16px] bg-[#0b0c0e] p-[10px] pb-0 ring-1 ring-black ${kiosk ? "min-h-0 flex-1" : ""}`}
        style={{ boxShadow: "0 40px 70px -35px rgb(0 0 0 / 0.85), inset 0 1px 0 rgb(255 255 255 / 0.07)" }}
      >
        <div className={`console @container relative overflow-hidden rounded-[4px] ${kiosk ? "min-h-0 flex-1" : ""}`}>
          <DashboardProvider orgName={config.dashboard.organisationName}>
            <Dashboard fixed={kiosk} />
          </DashboardProvider>
        </div>
        {/* chin, with a small label like a monitor maker's mark */}
        <div className="flex h-7 shrink-0 items-center justify-center" aria-hidden="true">
          <span className="text-[10.5px] font-medium tracking-[0.02em] text-white/35">{label ?? "Organisation dashboard"}</span>
        </div>
      </div>
      {/* stand */}
      <div className="flex shrink-0 flex-col items-center" aria-hidden="true" style={{ height: kiosk ? "clamp(22px, 3.2vh, 44px)" : 44 }}>
        <div className="w-[13%] min-w-14 flex-1" style={{ background: "linear-gradient(90deg, #17191c, #2a2d31 50%, #17191c)" }} />
        <div className="h-2 w-[26%] min-w-24 rounded-t-sm rounded-b-[8px] bg-[#1d2023]" />
      </div>
    </div>
  );
}

function useClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Dashboard({ fixed }: { fixed: boolean }) {
  const { state, dispatch, resetDemo } = useDashboard();
  const { config, preview } = useShowcaseView();
  const reduce = useReducedMotion();
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const now = useClock();
  const active = tabs.find((t) => t.id === state.tab)!;
  const Panel = panels[state.tab];
  const usedPct = Math.round((usage.minutesUsed / usage.minutesIncluded) * 100);

  // On narrower screens the sidebar collapses to an icon rail, like most consoles do.
  const rootRef = useRef<HTMLDivElement>(null);
  const [rail, setRail] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !fixed) return;
    const ro = new ResizeObserver(() => setRail(el.clientWidth < 1100));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixed]);

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
    <div ref={rootRef} className={`relative flex flex-col @xl:flex-row ${fixed ? "h-full" : "h-[640px] @xl:aspect-[16/10] @xl:h-auto"}`}>
      <div className="flag-band absolute inset-x-0 top-0 z-10 h-[9px]" aria-hidden="true" />
      {/* Sidebar (wide) / tab strip (narrow) */}
      <nav
        aria-label="Dashboard sections"
        className={`flex shrink-0 flex-col border-b border-line bg-surface pt-[9px] @xl:border-b-0 @xl:border-r ${rail ? "@xl:w-[76px]" : "@xl:w-[156px] @3xl:w-[184px] @4xl:w-[204px]"}`}
      >
        <div className={`hidden h-[47px] items-center gap-2 border-b border-line @xl:flex ${rail ? "justify-center px-0" : "px-3"}`} title={state.org.saved.orgName}>
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-fg text-[12px] font-bold text-surface" aria-hidden="true">
            {state.org.saved.orgName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "O"}
          </span>
          <div className={`min-w-0 flex-1 ${rail ? "hidden" : ""}`}>
            <p className="truncate text-[13px] font-semibold leading-tight text-fg">{state.org.saved.orgName}</p>
            <p className="truncate text-[11.5px] leading-tight text-muted">Contact centre</p>
          </div>
          {!rail && <ChevronsUpDown className="size-3.5 shrink-0 text-muted" aria-hidden="true" />}
        </div>
        <div
          ref={listRef}
          role="tablist"
          aria-orientation="vertical"
          aria-label="Dashboard sections"
          onKeyDown={onKey}
          className="scroll-thin flex gap-0.5 overflow-x-auto px-2 py-2 @xl:flex-col @xl:overflow-visible @xl:pt-2"
        >
          {tabs.map((t, i) => {
            const on = t.id === state.tab;
            const groupStart = i === 0 || tabs[i - 1].group !== t.group;
            return (
              <div key={t.id} className="contents">
                {groupStart && rail && i > 0 && <span className="mx-2 my-2 hidden h-px bg-line @xl:block" aria-hidden="true" />}
                {groupStart && !rail && (
                  <p className={`hidden px-2 pb-1 text-[11.5px] font-medium text-muted/80 @xl:block ${i === 0 ? "pt-1" : "pt-3"}`} aria-hidden="true">
                    {t.group}
                  </p>
                )}
                <button
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${t.id}`}
                  aria-selected={on}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => dispatch({ type: "tab", tab: t.id })}
                  title={rail ? t.label : undefined}
                  className={`flex shrink-0 items-center whitespace-nowrap rounded-md transition-colors ${rail ? "flex-col justify-center gap-1 px-0 py-2 text-[11px] leading-none" : "gap-2 px-2 py-1.5 text-[13px]"} ${
                    on ? "bg-fg font-medium text-surface" : "text-muted hover:bg-fg/5 hover:text-fg"
                  }`}
                >
                  <t.icon className={rail ? "size-[18px] shrink-0" : "size-[15px] shrink-0"} strokeWidth={on ? 2.2 : 1.8} aria-hidden="true" />
                  <span className="truncate">{rail ? t.short : t.label}</span>
                </button>
              </div>
            );
          })}
        </div>
        <div className={`mt-auto hidden space-y-2.5 border-t border-line @xl:block ${rail ? "px-0 py-3" : "p-3"}`}>
          <div className={rail ? "hidden" : ""}>
            <div className="flex items-baseline justify-between text-[11.5px]">
              <span className="text-muted">Voice minutes, {usage.period}</span>
              <span className="tabular-nums text-fg">{usedPct}%</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-fg/8" aria-hidden="true">
              <div className="h-full rounded-full bg-flag-blue" style={{ width: `${usedPct}%` }} />
            </div>
            <p className="mt-1 text-[11px] tabular-nums text-muted">
              {usage.minutesUsed.toLocaleString("en-GB")} of {usage.minutesIncluded.toLocaleString("en-GB")}
            </p>
          </div>
          <div className={`flex items-center gap-2 ${rail ? "justify-center" : ""}`} title="Kagiso M. · Administrator">
            <span className="grid size-6 place-items-center rounded-full bg-fg/10 text-[11px] font-semibold text-fg">KM</span>
            <div className={`min-w-0 ${rail ? "hidden" : ""}`}>
              <p className="truncate text-[12px] text-fg">Kagiso M.</p>
              <p className="truncate text-[11px] text-muted">Administrator</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-[56px] shrink-0 items-center gap-3 border-b border-line bg-surface px-3 pt-[9px] @md:px-5">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-fg">{active.label}</h3>
            <p className="hidden truncate text-[13px] text-muted @lg:block">{active.sub}</p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[11.5px] font-semibold text-fg"
            style={{ background: "repeating-linear-gradient(135deg, color-mix(in oklab, var(--warning) 22%, transparent) 0 5px, transparent 5px 10px)", boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--warning) 45%, transparent)" }}
            title="Sandbox workspace with sample data. Nothing here is connected to a live system."
          >
            <FlaskConical className="size-3" aria-hidden="true" />
            {config.dashboard.demoLabel}
          </span>
          <span className="hidden items-center gap-1.5 text-[13px] tabular-nums text-muted @2xl:flex">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            Live{now ? ` · ${now}` : ""}
          </span>
          <Button variant="ghost" className="!px-1.5" onClick={resetDemo} aria-label="Reset demo to default data and settings" title="Reset demo">
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </Button>
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${state.tab}`}
          tabIndex={0}
          className="@container scroll-thin min-h-0 flex-1 overflow-y-auto bg-page px-3 py-3 focus-visible:outline-offset-[-2px] @md:px-4"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${state.tab}-${state.epoch}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.12 }}
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
              className="flex max-w-md items-center gap-2 rounded-md border border-line-strong bg-raised px-3 py-2 text-[12.5px] text-fg shadow-xl"
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
