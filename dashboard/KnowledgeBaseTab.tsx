"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileText, FilePlus2, SearchX, Upload, X } from "lucide-react";
import { categories, type Category, type KbStatus } from "@/config/demo-data";
import { useDashboard } from "@/dashboard/state";
import { Badge, Button, Card, EmptyState, Field, SearchInput, Select, inputClass, statusTone } from "@/dashboard/ui";

export function KnowledgeBaseTab() {
  const { state, dispatch, notify } = useDashboard();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | Category>("All");
  const [status, setStatus] = useState<"All" | KbStatus>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const list = state.kb.filter(
    (e) =>
      (cat === "All" || e.category === cat) &&
      (status === "All" || e.status === status) &&
      `${e.name} ${e.summary}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const open = state.kb.find((e) => e.id === openId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search entries…" label="Search knowledge entries" />
        <Select srLabel label="Filter by category" value={cat} onChange={(v) => setCat(v as typeof cat)} options={[{ value: "All", label: "All categories" }, ...categories]} />
        <Select srLabel label="Filter by status" value={status} onChange={(v) => setStatus(v as typeof status)} options={[{ value: "All", label: "Any status" }, "Published", "Draft", "Needs review"]} />
        <Button variant="primary" onClick={() => setAdding(true)}>
          <FilePlus2 className="size-3.5" aria-hidden="true" /> Add document
        </Button>
      </div>

      <div className="grid gap-3 @3xl:grid-cols-[1fr_250px]">
        <Card bodyClassName="!p-0">
          {list.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching entries"
              body="Try a different search term or clear the filters."
              action={
                <Button onClick={() => { setQ(""); setCat("All"); setStatus("All"); }}>Clear filters</Button>
              }
            />
          ) : (
            <table className="w-full text-left text-[13px]">
              <caption className="sr-only">Sample knowledge entries</caption>
              <thead className="text-[11.5px] text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-3.5 py-2 font-medium">Entry</th>
                  <th scope="col" className="hidden px-2 py-2 font-medium @xl:table-cell">Category</th>
                  <th scope="col" className="px-2 py-2 font-medium">Status</th>
                  <th scope="col" className="hidden whitespace-nowrap px-2 py-2 text-right font-medium @2xl:table-cell">Uses, 7 days</th>
                  <th scope="col" className="hidden px-3.5 py-2 font-medium @lg:table-cell">Last edited</th>
                </tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr key={e.id} className={`border-b border-line last:border-0 ${openId === e.id ? "bg-flag-blue/15" : "hover:bg-fg/4"}`}>
                    <td className="px-3.5 py-2">
                      <button type="button" onClick={() => setOpenId(e.id)} className="flex items-center gap-2 text-left font-medium text-fg hover:text-sky-ink" aria-pressed={openId === e.id}>
                        <FileText className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
                        <span>{e.name}</span>
                      </button>
                    </td>
                    <td className="hidden px-2 py-2 text-muted @xl:table-cell">{e.category}</td>
                    <td className="px-2 py-2">
                      <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                    </td>
                    <td className="hidden px-2 py-2 text-right tabular-nums text-muted @2xl:table-cell">{e.uses ? e.uses.toLocaleString("en-GB") : "—"}</td>
                    <td className="hidden whitespace-nowrap px-3.5 py-2 text-muted @lg:table-cell">
                      {e.updated} <span className="text-muted/70">· {e.editor}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Entry details" className="h-fit">
          {open ? (
            <div className="space-y-2.5">
              <p className="text-[14px] font-semibold text-fg">{open.name}</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={statusTone(open.status)}>{open.status}</Badge>
                <Badge tone="muted" icon={false}>{open.category}</Badge>
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted">{open.summary}</p>
              <p className="text-[11.5px] text-muted">Last edited {open.updated} by {open.editor}{open.uses ? ` · used in ${open.uses} calls this week` : " · not used yet"}</p>
              {open.simulated && (
                <p className="rounded-lg border border-dashed border-warning/50 bg-warning/8 p-2 text-[11.5px] text-warning">
                  Sandbox entry. No file was uploaded or indexed.
                </p>
              )}
            </div>
          ) : (
            <p className="text-[12.5px] text-muted">Select an entry to see its details.</p>
          )}
        </Card>
      </div>

      {adding && (
        <AddDocumentModal
          onClose={() => setAdding(false)}
          onAdd={(name, category) => {
            const entry = {
              id: `kb-sim-${Date.now()}`,
              name,
              category,
              status: "Draft" as const,
              updated: "Just now",
              editor: "Kagiso M.",
              uses: 0,
              summary: "Waiting for a document. Lesedi starts using an entry once it has been processed and published.",
              simulated: true,
            };
            dispatch({ type: "kbAdd", entry });
            setOpenId(entry.id);
            setAdding(false);
            notify("Entry added as a draft.", "info");
          }}
        />
      )}
    </div>
  );
}

function AddDocumentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, category: Category) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("General enquiries");
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-page/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} className="w-full max-w-sm rounded-lg border border-line-strong bg-surface p-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 id={`${id}-title`} className="text-[14px] font-semibold text-fg">Add document</h3>
            <p className="mt-0.5 text-[12px] text-muted">Sandbox: files are not uploaded.</p>
          </div>
          <Button variant="ghost" className="!h-7 !px-1.5" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-col items-center rounded-md border border-dashed border-line-strong bg-sunken px-4 py-5 text-center" aria-hidden="true">
          <Upload className="size-5 text-muted" />
          <p className="mt-1.5 text-[12.5px] text-fg">Drop PDF, DOCX or TXT here</p>
          <p className="text-[11.5px] text-muted">Up to 20 MB</p>
        </div>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onAdd(name.trim(), category);
          }}
        >
          <Field label="Entry name" htmlFor={`${id}-name`}>
            <input ref={inputRef} id={`${id}-name`} className={inputClass} value={name} maxLength={70} onChange={(e) => setName(e.target.value)} placeholder="e.g. Returns policy" required />
          </Field>
          <Field label="Category" htmlFor={`${id}-cat`}>
            <Select id={`${id}-cat`} label="Category" value={category} onChange={(v) => setCategory(v as Category)} options={categories} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={!name.trim()}>
              Add entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
