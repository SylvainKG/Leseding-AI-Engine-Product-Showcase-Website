"use client";

import { useId } from "react";
import { channels, teamMembers, type OrgSettings } from "@/config/demo-data";
import { useDashboard } from "@/dashboard/state";
import { SaveBar } from "@/dashboard/AgentTab";
import { Card, Field, Toggle, inputClass } from "@/dashboard/ui";
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

      <div className="grid gap-3 @2xl:grid-cols-2">
        <Card title="Organisation">
          <div className="flex items-center gap-3">
            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-sunken">
              {brandSrc === null ? (
                <span className="font-display text-[18px] font-bold text-fg" aria-label={`${d.orgName} brand preview`}>
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
                description={c === "In-app (concept)" ? "Concept — not yet integrated" : c === "Phone call" ? "Main line +267 3•• ••00" : "Widget on your website"}
                checked={d.channels[c]}
                onChange={(v) => set({ channels: { ...d.channels, [c]: v } })}
              />
            ))}
          </div>
        </Card>

        <Card title="Handoff & contact">
          <div className="grid gap-3 @lg:grid-cols-2">
            <Field label="Handoff team inbox" htmlFor={`${id}-mail`} hint="Lesedi sends a call summary here with every transfer.">
              <input id={`${id}-mail`} type="email" className={inputClass} value={d.handoffEmail} onChange={(e) => set({ handoffEmail: e.target.value })} />
            </Field>
            <Field label="Team availability" htmlFor={`${id}-hrs`}>
              <input id={`${id}-hrs`} className={inputClass} value={d.handoffHours} onChange={(e) => set({ handoffHours: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card title="Team & roles">
          <ul className="space-y-2">
            {teamMembers.map((m) => (
              <li key={m.name} className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-fg/10 text-[11px] font-semibold text-fg">{m.initials}</span>
                <span className="flex-1 text-[13px] text-fg">{m.name}</span>
                <span className="text-[12px] text-muted">{m.role}</span>
                <span className="w-16 text-right text-[11.5px] text-muted">{m.lastActive}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <SaveBar
        dirty={dirty}
        note="Changes apply to new calls once saved."
        onCancel={() => dispatch({ type: "orgCancel" })}
        onSave={() => {
          dispatch({ type: "orgSave" });
          notify("Settings saved.");
        }}
      />
    </div>
  );
}

