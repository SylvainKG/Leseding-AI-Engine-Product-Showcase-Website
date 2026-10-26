"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileUp, Info, Loader2, RotateCcw, Save } from "lucide-react";
import { Logo } from "@/components/Brand";
import { resolveImage, useShowcaseStore } from "@/components/ShowcaseProvider";
import { ThemeEditor, type HexInputs } from "@/components/ThemeEditor";
import { ImageSlotEditor } from "@/components/ImageAssetEditor";
import { LivePreview, StateSamples } from "@/components/LivePreview";
import {
  defaultConfig,
  getSlotAlt,
  getSlotImage,
  imageSlots,
  setSlotAlt,
  setSlotImage,
  type ImageSlotId,
  type ShowcaseConfig,
  type ThemeConfig,
} from "@/config/showcase-config";
import { normalizeHex } from "@/lib/config-validation";
import { buildExport, downloadBlob, downloadJson, extForMime, readConfigFile } from "@/lib/export-import";
import type { StoredImage } from "@/lib/config-storage";

type Section = "colours" | "images" | "text" | "config";
const sections: Array<{ id: Section; label: string }> = [
  { id: "colours", label: "Colours" },
  { id: "images", label: "Images" },
  { id: "text", label: "Text & labels" },
  { id: "config", label: "Export / import" },
];

type Status = { tone: "success" | "error" | "info"; text: string } | null;

const toInputs = (t: ThemeConfig) => ({ ...t }) as HexInputs;

export function CustomizePage() {
  const store = useShowcaseStore();
  if (!store.hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center text-muted">
        <span className="flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading saved settings…
        </span>
      </div>
    );
  }
  return <CustomizeEditor />;
}

function CustomizeEditor() {
  const store = useShowcaseStore();
  const [draft, setDraft] = useState<ShowcaseConfig>(store.config);
  const [inputs, setInputs] = useState<HexInputs>(toInputs(store.config.theme));
  const [pending, setPending] = useState<Record<string, StoredImage | null>>({});
  const [section, setSection] = useState<Section>("colours");
  const [status, setStatus] = useState<Status>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  // Object URLs for images uploaded in this session but not yet saved.
  const pendingUrls = useMemo(() => {
    const out: Record<string, string> = {};
    Object.entries(pending).forEach(([slot, img]) => {
      if (img) out[slot] = URL.createObjectURL(img.blob);
    });
    return out;
  }, [pending]);
  useEffect(() => () => Object.values(pendingUrls).forEach((u) => URL.revokeObjectURL(u)), [pendingUrls]);

  const previewImages = useMemo(() => {
    const merged = { ...store.localImages };
    Object.entries(pending).forEach(([slot, img]) => {
      if (img) merged[slot] = pendingUrls[slot];
      else delete merged[slot];
    });
    return merged;
  }, [store.localImages, pending, pendingUrls]);

  const invalidHex = (Object.keys(inputs) as Array<keyof ThemeConfig>).filter((k) => !normalizeHex(inputs[k]));
  const dirty = JSON.stringify(draft) !== JSON.stringify(store.config) || Object.keys(pending).length > 0;

  const onHex = (key: keyof ThemeConfig, raw: string) => {
    setInputs((i) => ({ ...i, [key]: raw }));
    const hex = normalizeHex(raw);
    if (hex) setDraft((d) => ({ ...d, theme: { ...d.theme, [key]: hex } }));
  };

  const setBranding = (k: keyof ShowcaseConfig["branding"], v: string) => setDraft((d) => ({ ...d, branding: { ...d.branding, [k]: v } }));
  const setDash = (k: keyof ShowcaseConfig["dashboard"], v: string) => setDraft((d) => ({ ...d, dashboard: { ...d.dashboard, [k]: v } }));
  const setScene = (i: number, k: "title" | "caption", v: string) =>
    setDraft((d) => ({ ...d, scenes: d.scenes.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));

  const save = async () => {
    if (invalidHex.length) {
      setSection("colours");
      setStatus({ tone: "error", text: `Fix ${invalidHex.length} invalid colour value${invalidHex.length > 1 ? "s" : ""} before saving.` });
      return;
    }
    setSaving(true);
    const ok = await store.save(draft, pending);
    setSaving(false);
    if (ok) {
      setPending({});
      setInputs(toInputs(draft.theme));
      setStatus({ tone: "success", text: "Saved. The showcase in this browser now uses these settings." });
    } else {
      setStatus({ tone: "error", text: "Couldn't save — this browser may be blocking storage (e.g. private mode) or be out of space." });
    }
  };

  const reset = async () => {
    await store.reset();
    setDraft(defaultConfig);
    setInputs(toInputs(defaultConfig.theme));
    setPending({});
    setConfirmReset(false);
    setStatus({ tone: "info", text: "Restored the shipped defaults and removed images saved in this browser." });
  };

  const mimeFor = (slot: string) => pending[slot]?.blob.type ?? store.localImageMeta[slot]?.type ?? "image/png";

  const exportConfig = () => {
    const mimes: Record<string, string> = {};
    imageSlots.forEach((s) => (mimes[s.id] = mimeFor(s.id)));
    downloadJson(buildExport(draft, mimes), "leseding-showcase-config.json");
    setStatus({ tone: "info", text: "Configuration exported as leseding-showcase-config.json." });
  };

  const importConfig = async (file: File | undefined) => {
    if (!file) return;
    const res = await readConfigFile(file);
    if (!res.ok) {
      setStatus({ tone: "error", text: `Import failed: ${res.errors.slice(0, 3).join(" ")}${res.errors.length > 3 ? ` (+${res.errors.length - 3} more)` : ""}` });
      return;
    }
    setDraft(res.config);
    setInputs(toInputs(res.config.theme));
    setStatus({ tone: "info", text: "Configuration imported into the editor. Review the preview, then Save to apply it." });
  };

  const downloadSlot = async (slot: ImageSlotId) => {
    const s = imageSlots.find((x) => x.id === slot)!;
    const img = pending[slot] ?? (await store.getLocalBlob(slot));
    if (!img) return;
    const base = s.suggestedPath.split("/").pop();
    downloadBlob(img.blob, `${base}.${extForMime(img.blob.type, img.name)}`);
  };

  return (
    <div className="page-glow min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-page/85 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1640px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Logo compact />
            <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
            <h1 className="truncate font-display text-[17px] font-bold text-fg">Customize Showcase</h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg transition-colors hover:border-line-strong hover:bg-raised"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Back to Showcase</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1640px] px-4 pb-6 pt-6 sm:pb-36 sm:px-6 lg:px-8">
        <p className="flex items-start gap-2 rounded-xl border border-line bg-surface/70 px-4 py-3 text-[13px] text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            Changes apply to this browser unless shared configuration is implemented. Colours, labels and image references are kept in
            this browser&apos;s storage; uploaded images are kept in this browser&apos;s image store and never leave this device.
          </span>
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* Editor */}
          <div className="min-w-0">
            <div role="tablist" aria-label="Customization sections" className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={section === s.id}
                  aria-controls={`panel-${s.id}`}
                  onClick={() => setSection(s.id)}
                  onKeyDown={(e) => {
                    const i = sections.findIndex((x) => x.id === section);
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      const n = (i + (e.key === "ArrowRight" ? 1 : sections.length - 1)) % sections.length;
                      setSection(sections[n].id);
                      document.getElementById(`tab-${sections[n].id}`)?.focus();
                    }
                  }}
                  tabIndex={section === s.id ? 0 : -1}
                  className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    section === s.id ? "bg-primary text-primary-contrast" : "text-muted hover:bg-fg/5 hover:text-fg"
                  }`}
                >
                  {s.label}
                  {s.id === "colours" && invalidHex.length > 0 && <span className="ml-1.5 text-danger">•</span>}
                </button>
              ))}
            </div>

            <div id={`panel-${section}`} role="tabpanel" aria-labelledby={`tab-${section}`} className="mt-5">
              {section === "colours" && <ThemeEditor theme={draft.theme} inputs={inputs} onInput={onHex} />}

              {section === "images" && (
                <div className="space-y-3">
                  <p className="text-[12.5px] text-muted">
                    PNG, JPG or WebP, up to 5 MB each. Uploads preview immediately and are stored in this browser when you save. To publish
                    them for every visitor, download each image, place it in <code className="text-fg">/public</code>, and use the exported
                    configuration (see Export / import).
                  </p>
                  {imageSlots.map((slot) => {
                    const value = getSlotImage(draft, slot.id);
                    const src = resolveImage(value, previewImages);
                    const local = value.startsWith("idb:");
                    const assetName = !value
                      ? "Built-in coded mockup"
                      : local
                        ? (pending[slot.id]?.name ?? store.localImageMeta[slot.id]?.name ?? "Uploaded image") + " · this browser"
                        : value;
                    return (
                      <ImageSlotEditor
                        key={slot.id}
                        slot={slot}
                        value={value}
                        src={src}
                        isDefault={value === getSlotImage(defaultConfig, slot.id)}
                        assetName={slot.id === "logo" && !value ? "Built-in placeholder mark" : assetName}
                        alt={getSlotAlt(draft, slot.id)}
                        canDownload={local && !!(pending[slot.id] || store.localImages[slot.id])}
                        onApplyFile={(file) => {
                          setPending((p) => ({ ...p, [slot.id]: { blob: file, name: file.name } }));
                          setDraft((d) => setSlotImage(d, slot.id, `idb:${slot.id}`));
                          setStatus({ tone: "info", text: `${slot.label} updated in the preview. Save to keep it.` });
                        }}
                        onApplyRef={(ref) => {
                          setDraft((d) => setSlotImage(d, slot.id, ref));
                          if (store.localImages[slot.id] || pending[slot.id]) setPending((p) => ({ ...p, [slot.id]: null }));
                        }}
                        onRestore={() => {
                          setDraft((d) => setSlotImage(d, slot.id, getSlotImage(defaultConfig, slot.id)));
                          if (store.localImages[slot.id] || pending[slot.id]) setPending((p) => ({ ...p, [slot.id]: null }));
                          else
                            setPending((p) => {
                              const n = { ...p };
                              delete n[slot.id];
                              return n;
                            });
                        }}
                        onAlt={(alt) => setDraft((d) => setSlotAlt(d, slot.id, alt))}
                        onDownload={() => downloadSlot(slot.id)}
                      />
                    );
                  })}
                </div>
              )}

              {section === "text" && (
                <div className="space-y-4">
                  <TextGroup title="Header & hero">
                    <TextField label="Product name" value={draft.branding.productName} max={40} onChange={(v) => setBranding("productName", v)} />
                    <TextField label="Product tagline" value={draft.branding.tagline} max={80} onChange={(v) => setBranding("tagline", v)} />
                    <TextField label="Main page heading" value={draft.branding.mainHeading} max={80} onChange={(v) => setBranding("mainHeading", v)} />
                    <TextField label="Supporting copy" value={draft.branding.supportingCopy} max={360} multiline onChange={(v) => setBranding("supportingCopy", v)} />
                  </TextGroup>
                  <TextGroup title="Panels">
                    <TextField label="Customer panel heading" value={draft.branding.customerHeading} max={40} onChange={(v) => setBranding("customerHeading", v)} />
                    <TextField label="Dashboard panel heading" value={draft.branding.dashboardHeading} max={40} onChange={(v) => setBranding("dashboardHeading", v)} />
                    <TextField label="Demo organisation name" value={draft.dashboard.organisationName} max={60} onChange={(v) => setDash("organisationName", v)} />
                    <TextField label="Dashboard demo label" value={draft.dashboard.demoLabel} max={30} onChange={(v) => setDash("demoLabel", v)} />
                  </TextGroup>
                  <TextGroup title="Scene captions">
                    {draft.scenes.map((s, i) => (
                      <div key={s.id} className="grid gap-3 sm:grid-cols-[180px_1fr]">
                        <TextField label={`Scene ${i + 1} title`} value={s.title} max={40} onChange={(v) => setScene(i, "title", v)} />
                        <TextField label={`Scene ${i + 1} caption`} value={s.caption} max={160} onChange={(v) => setScene(i, "caption", v)} />
                      </div>
                    ))}
                  </TextGroup>
                  <TextGroup title="Footer">
                    <TextField label="Footer demo disclaimer" value={draft.branding.footerNote} max={160} onChange={(v) => setBranding("footerNote", v)} />
                  </TextGroup>
                </div>
              )}

              {section === "config" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-line bg-surface p-4">
                    <h2 className="text-[14px] font-semibold text-fg">Export configuration</h2>
                    <p className="mt-1 text-[12.5px] text-muted">
                      Downloads a JSON file with colours, text labels and image paths/URLs. Image files are not embedded — uploaded images
                      are listed with the <code className="text-fg">/public</code> path to save them at.
                    </p>
                    <button type="button" onClick={exportConfig} className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-raised px-3 text-[13px] font-medium text-fg hover:border-line-strong">
                      <Download className="size-4" aria-hidden="true" /> Export configuration
                    </button>
                  </div>
                  <div className="rounded-xl border border-line bg-surface p-4">
                    <h2 className="text-[14px] font-semibold text-fg">Import configuration</h2>
                    <p className="mt-1 text-[12.5px] text-muted">Loads a previously exported JSON file into the editor. Every field is validated; malformed files are rejected.</p>
                    <button type="button" onClick={() => importRef.current?.click()} className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-raised px-3 text-[13px] font-medium text-fg hover:border-line-strong">
                      <FileUp className="size-4" aria-hidden="true" /> Import configuration
                    </button>
                    <input
                      ref={importRef}
                      type="file"
                      accept="application/json,.json"
                      className="sr-only"
                      tabIndex={-1}
                      aria-label="Import configuration file"
                      onChange={(e) => {
                        importConfig(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <div className="rounded-xl border border-line bg-surface p-4">
                    <h2 className="text-[14px] font-semibold text-fg">Publishing for all visitors</h2>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12.5px] text-muted">
                      <li>Preview and save your colours, labels and images here.</li>
                      <li>Export the configuration and download any uploaded images.</li>
                      <li>Place the images in <code className="text-fg">public/showcase/</code> (logo in <code className="text-fg">public/logo/</code>).</li>
                      <li>Copy the values into <code className="text-fg">config/showcase-config.ts</code>.</li>
                      <li>Commit, push and let Vercel redeploy, then check the public URL in a private window.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <aside className="min-w-0 lg:sticky lg:top-[88px] lg:self-start" aria-label="Live preview">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-fg">Live preview</h2>
              <span className="text-[12px] text-muted">{dirty ? "Unsaved changes" : "Matches saved settings"}</span>
            </div>
            <LivePreview config={draft} localImages={previewImages} />
            <h2 className="mb-2 mt-5 text-[13px] font-semibold text-fg">Interface states</h2>
            <StateSamples config={draft} />
          </aside>
        </div>
      </main>

      {/* Action bar */}
      <div className="z-40 border-t sm:fixed sm:inset-x-0 sm:bottom-0 border-line bg-page/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1640px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="min-w-0 flex-1" role="status" aria-live="polite">
            {status ? (
              <p className={`text-[13px] font-medium ${status.tone === "success" ? "text-success" : status.tone === "error" ? "text-danger" : "text-fg"}`}>{status.text}</p>
            ) : null}
            <p className="text-[11.5px] text-muted">
              Saved changes apply to this browser. To publish them for all visitors, update the default configuration/assets and redeploy,
              unless a shared configuration service has been added.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {confirmReset ? (
              <>
                <span className="text-[12.5px] text-fg">Reset everything to the shipped defaults?</span>
                <button type="button" onClick={reset} className="inline-flex h-10 items-center rounded-lg bg-danger px-3.5 text-[13px] font-semibold text-white hover:opacity-90">
                  Yes, reset
                </button>
                <button type="button" onClick={() => setConfirmReset(false)} className="inline-flex h-10 items-center rounded-lg border border-line px-3.5 text-[13px] font-medium text-fg hover:border-line-strong">
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3.5 text-[13px] font-medium text-fg hover:border-line-strong">
                <RotateCcw className="size-4" aria-hidden="true" /> Reset to defaults
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-contrast transition-colors hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              Apply &amp; save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <legend className="px-1 text-[13px] font-semibold text-fg">{title}</legend>
      {children}
    </fieldset>
  );
}

function TextField({ label, value, onChange, max, multiline = false }: { label: string; value: string; onChange: (v: string) => void; max: number; multiline?: boolean }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cls =
    "mt-1.5 w-full rounded-lg border border-line bg-sunken px-3 py-2 text-[13px] text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[12.5px] font-medium text-fg">
          {label}
        </label>
        <span className="text-[11px] tabular-nums text-muted">
          {value.length}/{max}
        </span>
      </div>
      {multiline ? (
        <textarea id={id} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} className={`${cls} min-h-[84px] resize-y`} />
      ) : (
        <input id={id} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}
