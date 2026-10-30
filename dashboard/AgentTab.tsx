"use client";

import { useId } from "react";
import { Bot, Info } from "lucide-react";
import { languageOptions, type AgentSettings } from "@/config/demo-data";
import { useDashboard } from "@/dashboard/state";
import { Badge, Button, Card, Field, Select, Toggle, inputClass } from "@/dashboard/ui";

export function SaveBar({ dirty, onSave, onCancel, note }: { dirty: boolean; onSave: () => void; onCancel: () => void; note: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-3 mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface/95 px-3 py-2.5 backdrop-blur @md:-mx-4 @md:px-4">
      <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
        <Info className="size-3.5 shrink-0" aria-hidden="true" />
        {dirty ? "You have unsaved changes." : note}
      </p>
      <div className="flex gap-2">
        <Button onClick={onCancel} disabled={!dirty}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave} disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

export function AgentTab() {
  const { state, dispatch, notify } = useDashboard();
  const d = state.agent.draft;
  const dirty = JSON.stringify(d) !== JSON.stringify(state.agent.saved);
  const set = (patch: Partial<AgentSettings>) => dispatch({ type: "agentDraft", patch });
  const id = useId();

  return (
    <div>
      <div className="grid gap-3 @2xl:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <Card title="Identity">
            <div className="grid gap-3 @lg:grid-cols-2">
              <Field label="Agent display name" htmlFor={`${id}-name`}>
                <input id={`${id}-name`} className={inputClass} value={d.name} maxLength={32} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="Response style" htmlFor={`${id}-tone`}>
                <Select
                  id={`${id}-tone`}
                  label="Response style"
                  value={d.tone}
                  onChange={(v) => set({ tone: v as AgentSettings["tone"] })}
                  options={["Warm & professional", "Concise", "Friendly & casual"]}
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Welcome message" htmlFor={`${id}-welcome`} hint={`${d.welcome.length}/160 characters`}>
                <textarea
                  id={`${id}-welcome`}
                  className={`${inputClass} min-h-[58px] resize-none`}
                  maxLength={160}
                  value={d.welcome}
                  onChange={(e) => set({ welcome: e.target.value })}
                />
              </Field>
            </div>
          </Card>

          <Card title="Availability & handoff">
            <div className="space-y-3">
              <Toggle
                label="Agent status"
                description={d.active ? "Answering calls on all enabled channels" : "Paused. Calls go straight to your team"}
                checked={d.active}
                onChange={(v) => set({ active: v })}
              />
              <fieldset>
                <legend className="text-[12.5px] font-medium text-fg">Languages</legend>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {languageOptions.map((lang) => {
                    const on = d.languages.includes(lang);
                    return (
                      <label
                        key={lang}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] transition-colors ${
                          on ? "border-fg bg-fg/5 text-fg" : "border-line text-muted hover:border-line-strong"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="size-3.5 accent-[var(--brand-primary)]"
                          checked={on}
                          onChange={() => {
                            const next = on ? d.languages.filter((l) => l !== lang) : [...d.languages, lang];
                            if (next.length) set({ languages: next });
                          }}
                        />
                        {lang}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-1 text-[11.5px] text-muted">Lesedi answers in the caller&rsquo;s language and follows them if they switch mid-call.</p>
              </fieldset>
              <div className="grid gap-3 @lg:grid-cols-3">
                <Field label="Operating hours" htmlFor={`${id}-hours`}>
                  <Select id={`${id}-hours`} label="Operating hours" value={d.hoursMode} onChange={(v) => set({ hoursMode: v as AgentSettings["hoursMode"] })} options={["24/7", "Business hours"]} />
                </Field>
                <Field label="From" htmlFor={`${id}-from`}>
                  <input id={`${id}-from`} type="time" className={inputClass} value={d.hoursFrom} disabled={d.hoursMode === "24/7"} onChange={(e) => set({ hoursFrom: e.target.value })} />
                </Field>
                <Field label="To" htmlFor={`${id}-to`}>
                  <input id={`${id}-to`} type="time" className={inputClass} value={d.hoursTo} disabled={d.hoursMode === "24/7"} onChange={(e) => set({ hoursTo: e.target.value })} />
                </Field>
              </div>
              <Field label="Human handoff" htmlFor={`${id}-handoff`} hint="Billing disputes and identity checks always go to an agent.">
                <Select
                  id={`${id}-handoff`}
                  label="Human handoff"
                  value={d.handoff}
                  onChange={(v) => set({ handoff: v as AgentSettings["handoff"] })}
                  options={["On request", "After 2 failed answers", "For billing disputes"]}
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Live preview of the agent card */}
        <Card title="Greeting preview" className="h-fit">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-fg/8 text-fg">
              <Bot className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-fg">{d.name || "Unnamed agent"}</p>
              <p className="text-[11.5px] text-muted">{d.tone}</p>
            </div>
          </div>
          <div className="mt-3 rounded-md bg-sunken p-2.5 text-[12.5px] leading-relaxed text-fg ring-1 ring-line">
            {d.welcome || "…"}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone={d.active ? "success" : "muted"}>{d.active ? "Active" : "Paused"}</Badge>
            {d.languages.map((l) => (
              <Badge key={l} tone="primary" icon={false}>
                {l}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-muted">This is how Lesedi opens every call.</p>
        </Card>
      </div>

      <SaveBar
        dirty={dirty}
        note="Changes apply to new calls once saved."
        onCancel={() => dispatch({ type: "agentCancel" })}
        onSave={() => {
          dispatch({ type: "agentSave" });
          notify("Agent settings saved.");
        }}
      />
    </div>
  );
}
