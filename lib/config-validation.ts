import {
  CONFIG_VERSION,
  defaultConfig,
  type SceneId,
  type ShowcaseConfig,
  type ThemeConfig,
} from "@/config/showcase-config";

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Returns a normalised 6-digit uppercase hex (#RRGGBB), or null if invalid. */
export function normalizeHex(input: string): string | null {
  const m = input.trim().match(HEX_RE);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `#${h.toUpperCase()}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = (normalizeHex(hex) ?? "#000000").slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two hex colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastCheck = {
  id: string;
  label: string;
  fg: keyof ThemeConfig;
  bg: keyof ThemeConfig;
  min: number;
};

export const contrastChecks: ContrastCheck[] = [
  { id: "text-bg", label: "Text on page background", fg: "text", bg: "background", min: 4.5 },
  { id: "text-surface", label: "Text on panels", fg: "text", bg: "surface", min: 4.5 },
  { id: "muted-surface", label: "Muted text on panels", fg: "mutedText", bg: "surface", min: 3 },
  { id: "btn", label: "Button text on primary", fg: "primaryContrast", bg: "primary", min: 4.5 },
  { id: "primary-surface", label: "Primary accents on panels", fg: "primary", bg: "surface", min: 3 },
];

const IMAGE_RE = /^(|\/[\w\-./%]+\.(png|jpe?g|webp|svg|gif|avif)(\?.*)?|https:\/\/\S+|idb:[\w-]+)$/i;

/** Validates an image reference: "", a /public path, an https URL, or idb:slot. */
export function isValidImageRef(value: string): boolean {
  return IMAGE_RE.test(value.trim());
}

export function imageRefError(value: string): string | null {
  const v = value.trim();
  if (isValidImageRef(v)) return null;
  if (v.startsWith("http://")) return "Use an https:// address so it loads on the public site.";
  if (v.startsWith("/")) return "Path must end in .png, .jpg, .jpeg, .webp, .svg, .gif or .avif.";
  return "Enter a path starting with / (inside /public) or a full https:// URL.";
}

type Result = { ok: true; config: ShowcaseConfig } | { ok: false; errors: string[] };

function str(v: unknown, path: string, errors: string[], max = 600): string | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "string") {
    errors.push(`${path} must be text.`);
    return undefined;
  }
  if (v.length > max) {
    errors.push(`${path} is too long (max ${max} characters).`);
    return undefined;
  }
  return v;
}

/**
 * Validates an unknown value (e.g. parsed JSON or stored data) and merges it
 * over the defaults. Missing fields fall back to defaults; wrong types are errors.
 */
export function validateConfig(input: unknown): Result {
  const errors: string[] = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["The file does not contain a configuration object."] };
  }
  const raw = input as Record<string, unknown>;
  const out: ShowcaseConfig = structuredClone(defaultConfig);

  if (raw.version !== undefined && typeof raw.version !== "number") {
    errors.push("version must be a number.");
  } else if (typeof raw.version === "number" && raw.version > CONFIG_VERSION) {
    errors.push(`This file is from a newer showcase version (${raw.version}).`);
  }

  if (raw.theme !== undefined) {
    if (typeof raw.theme !== "object" || raw.theme === null) errors.push("theme must be an object.");
    else {
      const t = raw.theme as Record<string, unknown>;
      (Object.keys(out.theme) as Array<keyof ThemeConfig>).forEach((k) => {
        if (t[k] === undefined) return;
        const hex = typeof t[k] === "string" ? normalizeHex(t[k] as string) : null;
        if (!hex) errors.push(`theme.${k} is not a valid hex colour.`);
        else out.theme[k] = hex;
      });
    }
  }

  if (raw.branding !== undefined) {
    if (typeof raw.branding !== "object" || raw.branding === null)
      errors.push("branding must be an object.");
    else {
      const b = raw.branding as Record<string, unknown>;
      (Object.keys(out.branding) as Array<keyof ShowcaseConfig["branding"]>).forEach((k) => {
        const v = str(b[k], `branding.${k}`, errors);
        if (v === undefined) return;
        if (k === "logo" && !isValidImageRef(v)) errors.push("branding.logo is not a valid image path or URL.");
        else out.branding[k] = v;
      });
    }
  }

  if (raw.scenes !== undefined) {
    if (!Array.isArray(raw.scenes)) errors.push("scenes must be a list.");
    else {
      raw.scenes.forEach((s, i) => {
        if (!s || typeof s !== "object") return errors.push(`scenes[${i}] must be an object.`);
        const sc = s as Record<string, unknown>;
        const target = out.scenes.find((d) => d.id === (sc.id as SceneId));
        if (!target) return errors.push(`scenes[${i}].id must be phone-call, web-call or max-it-concept.`);
        const title = str(sc.title, `scenes[${i}].title`, errors, 60);
        const caption = str(sc.caption, `scenes[${i}].caption`, errors, 200);
        const image = str(sc.image, `scenes[${i}].image`, errors, 2000);
        const alt = str(sc.alt, `scenes[${i}].alt`, errors, 200);
        if (title !== undefined) target.title = title;
        if (caption !== undefined) target.caption = caption;
        if (alt !== undefined) target.alt = alt;
        if (image !== undefined) {
          if (!isValidImageRef(image)) errors.push(`scenes[${i}].image is not a valid image path or URL.`);
          else target.image = image;
        }
      });
    }
  }

  if (raw.dashboard !== undefined) {
    if (typeof raw.dashboard !== "object" || raw.dashboard === null)
      errors.push("dashboard must be an object.");
    else {
      const d = raw.dashboard as Record<string, unknown>;
      (Object.keys(out.dashboard) as Array<keyof ShowcaseConfig["dashboard"]>).forEach((k) => {
        const v = str(d[k], `dashboard.${k}`, errors, k === "brandImage" ? 2000 : 120);
        if (v === undefined) return;
        if (k === "brandImage" && !isValidImageRef(v))
          errors.push("dashboard.brandImage is not a valid image path or URL.");
        else out.dashboard[k] = v;
      });
    }
  }

  out.version = CONFIG_VERSION;
  return errors.length ? { ok: false, errors } : { ok: true, config: out };
}
