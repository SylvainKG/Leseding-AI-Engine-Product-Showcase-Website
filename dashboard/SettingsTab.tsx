"use client";

import { useId } from "react";
import { ShieldCheck } from "lucide-react";
import { channels, teamMembers, type OrgSettings } from "@/config/demo-data";
import { useDashboard } from "@/dashboard/state";
import { SaveBar } from "@/dashboard/AgentTab";
import { Badge, Card, Field, Toggle, inputClass } from "@/dashboard/ui";
import { SafeImage } from "@/components/Brand";
import { resolveImage, useShowcaseView } from "@/components/ShowcaseProvider";

export function SettingsTab() {
  const { state, dispatch, notify } = useDashboard();
  const { config, localImages } = useShowcaseView();
  const d = state.org.draft;
  const dirty = JSON.stringify(d) !== JSON.stringify(state.org.saved);
  const set = (patch: Partial<OrgSettings>) => dispatch({ type: "orgDraft", patch });
  const id = useId();
  const brandSrc = resolveImage(config.dashboard.brandImage, localImages);
  const initials = d.orgName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "O";

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 rounded-lg border border-dashed border-secondary/50 bg-secondary/8 px-3 py-2 text-[11px] text-fg">
        <ShieldCheck className="size-3.5 shrink-0 text-secondary" aria-hidden="true" />
        Demo settings only. No real credentials, numbers or private configuration are shown or stored.
      </p>

      <div className="grid gap-3 @2xl:grid-cols-2">
        <Card title="Organisation">
          <div className="flex items-center gap-3">
            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-sunken">
              {brandSrc === null ? (
                <span className="font-display text-[18px] font-bold text-primary" aria-label={`${d.orgName} brand preview`}>
                  {initials}
                </span>
              ) : (
                <SafeImage src={brandSrc} alt={config.dashboard.brandImageAlt} label="Brand" fit="contain" className="size-full" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Field label="Organisation name" htmlFor={`${id}-org`}>
                <input id={`${id}-org`} className={inputClass} value={d.orgName} maxLength={60} onChange={(e) => set({ orgName: e.target.value })} />
              </Field>
            </div>
          </div>
          <div className="mt-3">
            <Field label="Default support greeting" htmlFor={`${id}-greet`}>
              <textarea id={`${id}-greet`} className={`${inputClass} min-h-[56px] resize-none`} maxLength={160} value={d.greeting} onChange={(e) => set({ greeting: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card title="Channel availability">
          <div className="space-y-3">
            {channels.map((c) => (
              <Toggle
                key={c}
                label={c}
                description={c === "In-app (concept)" ? "Concept channel — not a live integration" : d.channels[c] ? "Enabled in this demo" : "Disabled in this demo"}
                checked={d.channels[c]}
                onChange={(v) => set({ channels: { ...d.channels, [c]: v } })}
              />
            ))}
          </div>
        </Card>

        <Card title="Handoff & contact">
          <div className="grid gap-3 @lg:grid-cols-2">
            <Field label="Handoff team inbox" htmlFor={`${id}-mail`} hint="Placeholder address for the demo.">
              <input id={`${id}-mail`} type="email" className={inputClass} value={d.handoffEmail} onChange={(e) => set({ handoffEmail: e.target.value })} />
            </Field>
            <Field label="Team availability" htmlFor={`${id}-hrs`}>
              <input id={`${id}-hrs`} className={inputClass} value={d.handoffHours} onChange={(e) => set({ handoffHours: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card title="Team & roles" action={<Badge tone="muted" icon={false}>Examples</Badge>}>
          <ul className="space-y-2">
            {teamMembers.map((m) => (
              <li key={m.name} className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">{m.initials}</span>
                <span className="flex-1 text-[12px] text-fg">{m.name}</span>
                <span className="text-[11px] text-muted">{m.role}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <SaveBar
        dirty={dirty}
        note="Demo settings are kept in memory only."
        onCancel={() => dispatch({ type: "orgCancel" })}
        onSave={() => {
          dispatch({ type: "orgSave" });
          notify("Organisation settings saved in this demo.");
        }}
      />
    </div>
  );
}

