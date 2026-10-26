import {
  imageSlots,
  getSlotImage,
  setSlotImage,
  type ShowcaseConfig,
} from "@/config/showcase-config";
import { validateConfig } from "@/lib/config-validation";

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export function extForMime(mime: string, fallbackName = ""): string {
  return EXT[mime] ?? fallbackName.split(".").pop()?.toLowerCase() ?? "png";
}

/**
 * Builds the export JSON. Browser-local images ("idb:<slot>") are replaced
 * with the /public path the developer should place the downloaded file at,
 * and listed under `assetsToPlace`. No image binaries are embedded.
 */
export function buildExport(
  config: ShowcaseConfig,
  localImageMime: Partial<Record<string, string>>,
) {
  let out = structuredClone(config);
  const assetsToPlace: Array<{ slot: string; publicPath: string }> = [];
  imageSlots.forEach((slot) => {
    const v = getSlotImage(out, slot.id);
    if (v.startsWith("idb:")) {
      const publicPath = `${slot.suggestedPath}.${extForMime(localImageMime[slot.id] ?? "image/png")}`;
      out = setSlotImage(out, slot.id, publicPath);
      assetsToPlace.push({ slot: slot.id, publicPath });
    }
  });
  return {
    ...out,
    exportedAt: new Date().toISOString(),
    ...(assetsToPlace.length
      ? {
          assetsToPlace,
          note: "Download each uploaded image from /customize and save it in /public at the listed path, then copy these values into config/showcase-config.ts and redeploy.",
        }
      : {}),
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJson(data: unknown, filename: string) {
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
}

export async function readConfigFile(
  file: File,
): Promise<{ ok: true; config: ShowcaseConfig } | { ok: false; errors: string[] }> {
  if (file.size > 512 * 1024) return { ok: false, errors: ["That file is too large to be a configuration file."] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return { ok: false, errors: ["That file is not valid JSON."] };
  }
  // Ignore export-only metadata fields.
  if (parsed && typeof parsed === "object") {
    const p = parsed as Record<string, unknown>;
    delete p.exportedAt;
    delete p.assetsToPlace;
    delete p.note;
  }
  const result = validateConfig(parsed);
  if (!result.ok) return result;
  // An imported file can't carry this browser's uploaded images; drop dangling refs.
  let config = result.config;
  imageSlots.forEach((slot) => {
    if (getSlotImage(config, slot.id).startsWith("idb:")) config = setSlotImage(config, slot.id, "");
  });
  return { ok: true, config };
}
