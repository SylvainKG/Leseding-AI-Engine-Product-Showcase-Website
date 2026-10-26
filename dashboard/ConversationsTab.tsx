"use client";

import { useState } from "react";
import { MessageSquareDashed, PhoneCall, Globe, Smartphone, SearchX, X } from "lucide-react";
import { channels, conversations, type Channel, type ConvStatus } from "@/config/demo-data";
import { Badge, Button, Card, DemoTag, EmptyState, SearchInput, Select, statusTone } from "@/dashboard/ui";

const channelIcon: Record<Channel, typeof PhoneCall> = {
  "Phone call": PhoneCall,
  "Web call": Globe,
  "In-app (concept)": Smartphone,
};

export function ConversationsTab() {
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<"All" | Channel>("All");
  const [status, setStatus] = useState<"All" | ConvStatus>("All");
  const [selected, setSelected] = useState<string | null>(conversations[0].ref);

  const list = conversations.filter(
    (c) =>
      (channel === "All" || c.channel === channel) &&
      (status === "All" || c.status === status) &&
      `${c.ref} ${c.topic}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const conv = conversations.find((c) => c.ref === selected) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search by reference or topic…" label="Search conversations" />
        <Select srLabel label="Filter by channel" value={channel} onChange={(v) => setChannel(v as typeof channel)} options={[{ value: "All", label: "All channels" }, ...channels]} />
        <Select srLabel label="Filter by status" value={status} onChange={(v) => setStatus(v as typeof status)} options={[{ value: "All", label: "Any status" }, "Resolved", "Escalated", "In progress"]} />
      </div>

      <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card bodyClassName="!p-1.5">
          {list.length === 0 ? (
            <EmptyState icon={SearchX} title="No conversations found" body="No sample conversations match these filters." action={<Button onClick={() => { setQ(""); setChannel("All"); setStatus("All"); }}>Clear filters</Button>} />
          ) : (
            <ul className="space-y-1" aria-label="Sample conversations">
              {list.map((c) => {
                const Icon = channelIcon[c.channel];
                const on = c.ref === selected;
                return (
                  <li key={c.ref}>
                    <button
                      type="button"
                      onClick={() => setSelected(c.ref)}
                      aria-current={on ? "true" : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${on ? "bg-primary/12 ring-1 ring-inset ring-primary/40" : "hover:bg-fg/5"}`}
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-fg/6 text-muted">
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[12px] font-medium text-fg">{c.topic}</span>
                        </span>
                        <span className="block truncate text-[10.5px] text-muted">
                          {c.ref} · {c.channel} · {c.date}
                        </span>
                      </span>
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card
          title={conv ? `${conv.ref} · ${conv.topic}` : "Conversation"}
          action={conv ? (
            <Button variant="ghost" className="!h-6 !px-1.5" onClick={() => setSelected(null)} aria-label="Close conversation">
              <X className="size-3.5" />
            </Button>
          ) : undefined}
          className="h-fit"
        >
          {conv ? (
            <div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                <dt className="text-muted">Channel</dt><dd className="text-fg">{conv.channel}</dd>
                <dt className="text-muted">Language</dt><dd className="text-fg">{conv.language}</dd>
                <dt className="text-muted">Category</dt><dd className="text-fg">{conv.category}</dd>
                <dt className="text-muted">Outcome</dt>
                <dd><Badge tone={statusTone(conv.status)}>{conv.outcome}</Badge></dd>
              </dl>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">Transcript</p>
                <DemoTag>Demo content</DemoTag>
              </div>
              <ol className="mt-2 space-y-2">
                {conv.transcript.map((m, i) => {
                  const mine = m.who === "Customer";
                  return (
                    <li key={i} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <span className="mb-0.5 text-[9.5px] font-medium text-muted">{m.who}</span>
                      <span
                        className={`max-w-[88%] rounded-xl px-2.5 py-1.5 text-[11.5px] leading-snug ${
                          mine
                            ? "rounded-br-sm bg-primary text-primary-contrast"
                            : m.who === "Support team"
                              ? "rounded-bl-sm bg-success/12 text-fg ring-1 ring-inset ring-success/30"
                              : "rounded-bl-sm bg-sunken text-fg ring-1 ring-inset ring-line"
                        }`}
                      >
                        {m.text}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <EmptyState icon={MessageSquareDashed} title="No conversation selected" body="Choose a conversation to read its sample transcript." />
          )}
        </Card>
      </div>
    </div>
  );
}
