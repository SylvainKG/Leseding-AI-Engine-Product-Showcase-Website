"use client";

import { useState } from "react";
import { Globe, MessageSquareDashed, PhoneCall, PhoneForwarded, SearchX, Smartphone, X } from "lucide-react";
import { channels, conversations, type Channel, type ConvStatus, type Conversation } from "@/config/demo-data";
import { Badge, Button, Card, EmptyState, SearchInput, Select, statusTone } from "@/dashboard/ui";

const channelIcon: Record<Channel, typeof PhoneCall> = {
  "Phone call": PhoneCall,
  "Web call": Globe,
  "In-app (concept)": Smartphone,
};

const statusLabel: Record<ConvStatus, string> = {
  Resolved: "Resolved by Lesedi",
  Transferred: "Transferred",
  Abandoned: "Caller hung up",
};

const toSec = (mmss: string) => {
  const [m, s] = mmss.split(":").map(Number);
  return m * 60 + s;
};

/** A thin timeline of the call: who spoke when, and where it was handed over. */
function CallStrip({ conv }: { conv: Conversation }) {
  const total = Math.max(toSec(conv.duration), 1);
  const turns = conv.transcript.filter((t) => t.text);
  return (
    <div className="mt-3" aria-hidden="true">
      <div className="relative h-5 rounded-sm bg-fg/5">
        {turns.map((t, i) => {
          const start = toSec(t.at);
          const next = i + 1 < turns.length ? toSec(turns[i + 1].at) : Math.min(start + 12, total);
          const width = Math.max(((next - start) / total) * 100 - 0.6, 1.2);
          const color =
            t.who === "Caller" ? "bg-[var(--chart-abandoned)]" : t.who === "Agent" ? "bg-[var(--chart-transferred)]" : "bg-[var(--chart-resolved)]";
          return <span key={i} className={`absolute top-1 bottom-1 rounded-[1px] ${color}`} style={{ left: `${(start / total) * 100}%`, width: `${width}%` }} />;
        })}
      </div>
      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted">
        <span>0:00</span>
        <span className="flex gap-3">
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-[1px] bg-[var(--chart-resolved)]" />Lesedi</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-[1px] bg-[var(--chart-abandoned)]" />Caller</span>
          {conv.transferTo && <span className="flex items-center gap-1"><span className="size-1.5 rounded-[1px] bg-[var(--chart-transferred)]" />Agent</span>}
        </span>
        <span>{conv.duration}</span>
      </div>
    </div>
  );
}

export function ConversationsTab() {
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<"All" | Channel>("All");
  const [status, setStatus] = useState<"All" | ConvStatus>("All");
  const [selected, setSelected] = useState<string | null>(conversations[1].ref);

  const list = conversations.filter(
    (c) =>
      (channel === "All" || c.channel === channel) &&
      (status === "All" || c.status === status) &&
      `${c.ref} ${c.intent} ${c.caller}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const conv = conversations.find((c) => c.ref === selected) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search reference, reason or number" label="Search conversations" />
        <Select srLabel label="Filter by channel" value={channel} onChange={(v) => setChannel(v as typeof channel)} options={[{ value: "All", label: "All channels" }, ...channels]} />
        <Select
          srLabel
          label="Filter by outcome"
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
          options={[{ value: "All", label: "Any outcome" }, { value: "Resolved", label: "Resolved by Lesedi" }, { value: "Transferred", label: "Transferred" }, { value: "Abandoned", label: "Caller hung up" }]}
        />
      </div>

      <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card bodyClassName="!p-0">
          {list.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No calls match"
              body="Try another search, or clear the filters to see every call from today."
              action={<Button onClick={() => { setQ(""); setChannel("All"); setStatus("All"); }}>Clear filters</Button>}
            />
          ) : (
            <table className="w-full text-left text-[12.5px]">
              <caption className="sr-only">Calls from today</caption>
              <thead>
                <tr className="border-b border-line text-[11.5px] text-muted">
                  <th scope="col" className="px-3 py-1.5 font-medium">Time</th>
                  <th scope="col" className="px-2 py-1.5 font-medium">Reason</th>
                  <th scope="col" className="hidden px-2 py-1.5 font-medium @xl:table-cell">Language</th>
                  <th scope="col" className="hidden px-2 py-1.5 text-right font-medium @lg:table-cell">Length</th>
                  <th scope="col" className="px-3 py-1.5 font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const Icon = channelIcon[c.channel];
                  const on = c.ref === selected;
                  return (
                    <tr
                      key={c.ref}
                      onClick={() => setSelected(c.ref)}
                      className={`cursor-pointer border-b border-line last:border-0 ${on ? "bg-flag-blue/15" : "hover:bg-fg/4"}`}
                    >
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted">{c.when.replace("Today ", "")}</td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setSelected(c.ref)}
                          aria-current={on ? "true" : undefined}
                          className="flex min-w-0 items-center gap-2 text-left"
                        >
                          <Icon className="size-3.5 shrink-0 text-muted" aria-label={c.channel} />
                          <span className="min-w-0">
                            <span className="block truncate text-fg">{c.intent}</span>
                            <span className="block truncate text-[11.5px] tabular-nums text-muted">{c.caller}</span>
                          </span>
                        </button>
                      </td>
                      <td className="hidden px-2 py-2 text-muted @xl:table-cell">{c.language}</td>
                      <td className="hidden px-2 py-2 text-right tabular-nums text-muted @lg:table-cell">{c.duration}</td>
                      <td className="px-3 py-2">
                        <Badge tone={statusTone(c.status)}>{statusLabel[c.status]}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card
          title={conv ? <span className="tabular-nums">{conv.ref}</span> : "Call"}
          action={
            conv ? (
              <Button variant="ghost" className="!h-6 !px-1.5" onClick={() => setSelected(null)} aria-label="Close call">
                <X className="size-3.5" />
              </Button>
            ) : undefined
          }
          className="h-fit"
        >
          {conv ? (
            <div>
              <p className="text-[14px] font-semibold text-fg">{conv.intent}</p>
              <p className="mt-0.5 text-[12px] tabular-nums text-muted">
                {conv.when} · {conv.caller} · {conv.channel} · {conv.language}
              </p>
              <div className="mt-2">
                <Badge tone={statusTone(conv.status)}>{statusLabel[conv.status]}</Badge>
              </div>
              {conv.transferTo && (
                <p className="mt-2 flex items-start gap-1.5 rounded-md border border-warning/30 bg-warning/8 px-2 py-1.5 text-[12px] text-fg">
                  <PhoneForwarded className="mt-px size-3.5 shrink-0 text-warning" aria-hidden="true" />
                  <span>
                    Sent to {conv.transferTo}. <span className="text-muted">{conv.reason}.</span>
                  </span>
                </p>
              )}

              <CallStrip conv={conv} />

              <ol className="mt-3 space-y-2.5 border-t border-line pt-3">
                {conv.transcript.map((m, i) => (
                  <li key={i} className="grid grid-cols-[2.4rem_minmax(0,1fr)] gap-x-2">
                    <span className="pt-px text-[11.5px] tabular-nums text-muted">{m.at}</span>
                    <div>
                      <p className={`text-[11.5px] font-medium ${m.who === "Lesedi" ? "text-sky-ink" : m.who === "Agent" ? "text-fg" : "text-muted"}`}>
                        {m.who === "Agent" ? "Agent" : m.who}
                      </p>
                      {m.text && <p className="text-[12.5px] leading-snug text-fg">{m.text}</p>}
                      {m.note && <p className="mt-0.5 text-[11.5px] italic text-muted">{m.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <EmptyState icon={MessageSquareDashed} title="No call selected" body="Choose a call from the list to read its transcript." />
          )}
        </Card>
      </div>
    </div>
  );
}
