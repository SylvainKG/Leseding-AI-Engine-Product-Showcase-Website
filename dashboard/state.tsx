"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import {
  defaultAgentSettings,
  defaultOrgSettings,
  kbEntries,
  type AgentSettings,
  type KbEntry,
  type OrgSettings,
} from "@/config/demo-data";

/**
 * Simulated dashboard state. Lives only in memory: nothing here talks to a
 * backend or a live Leseding AI agent. "Reset demo" restores the defaults.
 */

export type TabId = "overview" | "agent" | "knowledge" | "conversations" | "analytics" | "settings";

type Toast = { id: number; message: string; tone: "success" | "info" };

type State = {
  tab: TabId;
  agent: { saved: AgentSettings; draft: AgentSettings };
  org: { saved: OrgSettings; draft: OrgSettings };
  kb: KbEntry[];
  toast: Toast | null;
  /** Bumped by Reset demo so tabs remount and clear local filters. */
  epoch: number;
};

type Action =
  | { type: "tab"; tab: TabId }
  | { type: "agentDraft"; patch: Partial<AgentSettings> }
  | { type: "agentSave" }
  | { type: "agentCancel" }
  | { type: "orgDraft"; patch: Partial<OrgSettings> }
  | { type: "orgSave" }
  | { type: "orgCancel" }
  | { type: "kbAdd"; entry: KbEntry }
  | { type: "toast"; toast: Toast | null }
  | { type: "reset"; orgName: string };

const init = (orgName: string): State => ({
  tab: "overview",
  agent: { saved: defaultAgentSettings, draft: defaultAgentSettings },
  org: { saved: defaultOrgSettings(orgName), draft: defaultOrgSettings(orgName) },
  kb: kbEntries,
  toast: null,
  epoch: 0,
});

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "tab":
      return { ...s, tab: a.tab };
    case "agentDraft":
      return { ...s, agent: { ...s.agent, draft: { ...s.agent.draft, ...a.patch } } };
    case "agentSave":
      return { ...s, agent: { saved: s.agent.draft, draft: s.agent.draft } };
    case "agentCancel":
      return { ...s, agent: { ...s.agent, draft: s.agent.saved } };
    case "orgDraft":
      return { ...s, org: { ...s.org, draft: { ...s.org.draft, ...a.patch } } };
    case "orgSave":
      return { ...s, org: { saved: s.org.draft, draft: s.org.draft } };
    case "orgCancel":
      return { ...s, org: { ...s.org, draft: s.org.saved } };
    case "kbAdd":
      return { ...s, kb: [a.entry, ...s.kb] };
    case "toast":
      return { ...s, toast: a.toast };
    case "reset":
      return { ...init(a.orgName), tab: s.tab, epoch: s.epoch + 1 };
  }
}

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  notify: (message: string, tone?: Toast["tone"]) => void;
  resetDemo: () => void;
};

const DashboardContext = createContext<Ctx | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

export function DashboardProvider({ orgName, children }: { orgName: string; children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, orgName, init);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string, tone: Toast["tone"] = "success") => {
    if (timer.current) clearTimeout(timer.current);
    dispatch({ type: "toast", toast: { id: Date.now(), message, tone } });
    timer.current = setTimeout(() => dispatch({ type: "toast", toast: null }), 3200);
  }, []);

  const resetDemo = useCallback(() => {
    dispatch({ type: "reset", orgName });
    notify("Demo reset — all sample data and settings restored.", "info");
  }, [orgName, notify]);

  // If the configured organisation name changes (via /customize), follow it
  // unless the visitor has edited the demo name.
  const lastOrg = useRef(orgName);
  useEffect(() => {
    if (lastOrg.current === orgName) return;
    if (state.org.saved.orgName === lastOrg.current) {
      dispatch({ type: "orgDraft", patch: { orgName } });
      dispatch({ type: "orgSave" });
    }
    lastOrg.current = orgName;
  }, [orgName, state.org.saved.orgName]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value = useMemo(() => ({ state, dispatch, notify, resetDemo }), [state, notify, resetDemo]);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
