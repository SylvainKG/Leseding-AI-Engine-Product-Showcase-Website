"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Download, ImageIcon, Link2, RotateCcw, Upload } from "lucide-react";
import { imageSlots, type ImageSlotId } from "@/config/showcase-config";
import { imageRefError } from "@/lib/config-validation";
import { SafeImage } from "@/components/Brand";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

type SlotProps = {
  slot: (typeof imageSlots)[number];
  /** Current reference in the draft config. */
  value: string;
  /** URL for the preview thumbnail (null → built-in). */
  src: string | null;
  isDefault: boolean;
  assetName: string;
  alt: string;
  canDownload: boolean;
  onApplyFile: (file: File) => void;
  onApplyRef: (ref: string) => void;
  onRestore: () => void;
  onAlt: (alt: string) => void;
  onDownload: () => void;
};

const btn =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-raised px-2.5 text-[12px] font-medium text-fg transition-colors hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-45";

export function ImageSlotEditor(p: SlotProps) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [urlValue, setUrlValue] = useState(p.value.startsWith("idb:") ? "" : p.value);
  const urlError = urlValue ? imageRefError(urlValue) : null;

  useEffect(() => () => {
    if (pending) URL.revokeObjectURL(pending.url);
  }, [pending]);

  const pick = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      setError("Please choose a PNG, JPG/JPEG or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`);
      return;
    }
    setPending({ file, url: URL.createObjectURL(file) });
  };

  const shownSrc = pending ? pending.url : p.src;
  const fitCls = p.slot.fit === "contain" ? "p-3" : "";

  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex gap-3.5">
        <div
          className={`relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-sunken ${
            p.slot.fit === "cover" ? "h-[120px] w-[64px]" : "h-[72px] w-[96px]"
          }`}
        >
          {shownSrc === null ? (
            <span className="flex flex-col items-center gap-1 px-1 text-center text-[10px] text-muted">
              <ImageIcon className="size-4" aria-hidden="true" />
              Built-in
            </span>
          ) : (
            <SafeImage src={shownSrc} alt={pending ? `Preview of ${pending.file.name}` : p.alt} label={p.slot.label} fit={p.slot.fit} className={`size-full ${fitCls}`} />
          )}
          {pending && (
            <span className="absolute inset-x-0 bottom-0 bg-secondary py-0.5 text-center text-[9px] font-bold text-page">PREVIEW</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="text-[13px] font-semibold text-fg">{p.slot.label}</h3>
            {p.isDefault && !pending && <span className="text-[11px] text-muted">Default</span>}
          </div>
          <p className="truncate text-[11.5px] text-muted" title={pending ? pending.file.name : p.assetName}>
            {pending ? `New: ${pending.file.name} (${Math.round(pending.file.size / 1024)} KB)` : p.assetName}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">{p.slot.hint}</p>

          {pending ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                className={`${btn} border-transparent bg-primary text-primary-contrast hover:bg-primary-hover`}
                onClick={() => {
                  p.onApplyFile(pending.file);
                  setPending(null);
                }}
              >
                Use this image
              </button>
              <button type="button" className={btn} onClick={() => setPending(null)}>
                Discard
              </button>
            </div>
          ) : (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
                <Upload className="size-3.5" aria-hidden="true" />
                {p.isDefault ? "Upload image" : "Replace"}
              </button>
              <button type="button" className={btn} onClick={p.onRestore} disabled={p.isDefault}>
                <RotateCcw className="size-3.5" aria-hidden="true" /> Restore default
              </button>
              <button type="button" className={btn} onClick={() => setShowUrl((s) => !s)} aria-expanded={showUrl}>
                <Link2 className="size-3.5" aria-hidden="true" /> URL / path
              </button>
              {p.canDownload && (
                <button type="button" className={btn} onClick={p.onDownload}>
                  <Download className="size-3.5" aria-hidden="true" /> Download
                </button>
              )}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label={`Upload ${p.slot.label}`}
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {error && (
            <p role="alert" className="mt-2 text-[11.5px] text-danger">
              {error}
            </p>
          )}
        </div>
      </div>

      {showUrl && (
        <div className="mt-3 border-t border-line pt-3">
          <label htmlFor={`${id}-url`} className="block text-[12px] font-medium text-fg">
            Image URL or public asset path
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id={`${id}-url`}
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder={`${p.slot.suggestedPath}.webp`}
              spellCheck={false}
              aria-invalid={!!urlError}
              aria-describedby={`${id}-url-help`}
              className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-sunken px-2.5 font-mono text-[12px] text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button type="button" className={btn} disabled={!urlValue || !!urlError} onClick={() => p.onApplyRef(urlValue.trim())}>
              Use
            </button>
          </div>
          <p id={`${id}-url-help`} className={`mt-1 text-[11px] ${urlError ? "text-danger" : "text-muted"}`}>
            {urlError ?? "A file in /public (e.g. /showcase/phone-call.webp) or a public https:// URL. It must be deployed or reachable to show for visitors."}
          </p>
        </div>
      )}

      <div className="mt-3">
        <label htmlFor={`${id}-alt`} className="block text-[12px] font-medium text-fg">
          Alternative text <span className="font-normal text-muted">(for screen readers)</span>
        </label>
        <input
          id={`${id}-alt`}
          value={p.alt}
          maxLength={200}
          onChange={(e) => p.onAlt(e.target.value)}
          className="mt-1.5 h-8 w-full rounded-lg border border-line bg-sunken px-2.5 text-[12px] text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>
  );
}

export type { ImageSlotId };
