/**
 * Central default configuration for the Leseding AI Engine showcase.
 *
 * This is the ONLY place shipped brand colours, labels and image paths live.
 * To publish a change for every visitor: update the values below (or paste the
 * values from a JSON file exported on /customize), put any new images in
 * /public/showcase or /public/logo, commit, and redeploy.
 *
 * Image fields accept:
 *   ""                      → use the built-in coded mockup / logo mark
 *   "/showcase/file.webp"   → a file inside /public
 *   "https://…"             → an absolute, publicly reachable URL
 *   "idb:<slot>"            → (browser-local only) an image uploaded on /customize
 */

export const CONFIG_VERSION = 1;
export const STORAGE_KEY = "leseding-showcase-config-v1";

export type SceneId = "phone-call" | "web-call" | "max-it-concept";

export type ThemeConfig = {
  primary: string;
  primaryContrast: string;
  secondary: string;
  background: string;
  surface: string;
  sectionCard: string;
  sectionCardText: string;
  text: string;
  mutedText: string;
  border: string;
  success: string;
  warning: string;
};

export type SceneConfig = {
  id: SceneId;
  title: string;
  caption: string;
  image: string;
  alt: string;
};

export type ShowcaseConfig = {
  version: number;
  theme: ThemeConfig;
  branding: {
    logo: string;
    logoAlt: string;
    productName: string;
    tagline: string;
    mainHeading: string;
    supportingCopy: string;
    customerHeading: string;
    dashboardHeading: string;
    footerNote: string;
  };
  scenes: SceneConfig[];
  dashboard: {
    organisationName: string;
    demoLabel: string;
    brandImage: string;
    brandImageAlt: string;
  };
};

export const defaultConfig: ShowcaseConfig = {
  version: CONFIG_VERSION,
  theme: {
    primary: "#3D6BF5",
    primaryContrast: "#FFFFFF",
    secondary: "#F2A93B",
    background: "#060A18",
    surface: "#0D1430",
    sectionCard: "#FFFFFF",
    sectionCardText: "#0D1430",
    text: "#E9EDF9",
    mutedText: "#8E98B8",
    border: "#1F2A4E",
    success: "#2FBF71",
    warning: "#F0A23A",
  },
  branding: {
    logo: "",
    logoAlt: "Leseding AI Engine",
    productName: "Leseding AI Engine",
    tagline: "Voice-first AI customer support",
    mainHeading: "Customer support, starting with a voice.",
    supportingCopy:
      "Leseding AI Engine is a voice-first support agent built for organisations in Botswana. Customers reach it the way they already do — a phone call, a web call, or an app — and your team shapes what it knows and how it answers from one dashboard.",
    customerHeading: "Customer Experience",
    dashboardHeading: "Organisation Dashboard",
    footerNote: "Interactive demonstration — sample data and simulated controls.",
  },
  scenes: [
    {
      id: "phone-call",
      title: "Phone call",
      caption: "Reach the support agent through a regular phone call.",
      image: "/showcase/phone-call.webp",
      alt: "An iPhone in an active phone call with Leseding AI Engine",
    },
    {
      id: "web-call",
      title: "Web call",
      caption: "A browser-based way to speak with the agent.",
      image: "/showcase/web-call.webp",
      alt: "A mobile browser showing an active Leseding AI Agent web call with Mute and End call buttons",
    },
    {
      id: "max-it-concept",
      title: "Max it concept",
      caption: "An illustrative in-app experience.",
      image: "/showcase/max-it-concept.webp",
      alt: "Concept mockup of the Max it app home screen with the Leseding AI Engine voice assistant chat panel open",
    },
  ],
  dashboard: {
    organisationName: "Kgosi Utilities",
    demoLabel: "Sandbox",
    brandImage: "",
    brandImageAlt: "Organisation brand preview",
  },
};

/** Image slots editable on /customize, and where each lives in the config. */
export type ImageSlotId = "logo" | SceneId | "org-brand";

export const imageSlots: Array<{
  id: ImageSlotId;
  label: string;
  hint: string;
  fit: "contain" | "cover";
  suggestedPath: string;
}> = [
  {
    id: "logo",
    label: "Logo",
    hint: "SVG or transparent PNG/WebP, landscape or square.",
    fit: "contain",
    suggestedPath: "/logo/leseding-logo",
  },
  {
    id: "phone-call",
    label: "Phone-call scene",
    hint: "Portrait screen capture, about 9:19.5 (e.g. 1170×2532).",
    fit: "cover",
    suggestedPath: "/showcase/phone-call",
  },
  {
    id: "web-call",
    label: "Web-call scene",
    hint: "Portrait screen capture, about 9:19.5.",
    fit: "cover",
    suggestedPath: "/showcase/web-call",
  },
  {
    id: "max-it-concept",
    label: "Max it concept",
    hint: "Portrait screen capture. Use only approved assets.",
    fit: "cover",
    suggestedPath: "/showcase/max-it-concept",
  },
  {
    id: "org-brand",
    label: "Organisation brand preview",
    hint: "Optional. Square logo used in Organisation Settings.",
    fit: "contain",
    suggestedPath: "/showcase/org-brand",
  },
];

export function getSlotImage(config: ShowcaseConfig, slot: ImageSlotId): string {
  if (slot === "logo") return config.branding.logo;
  if (slot === "org-brand") return config.dashboard.brandImage;
  return config.scenes.find((s) => s.id === slot)?.image ?? "";
}

export function setSlotImage(
  config: ShowcaseConfig,
  slot: ImageSlotId,
  value: string,
): ShowcaseConfig {
  if (slot === "logo") return { ...config, branding: { ...config.branding, logo: value } };
  if (slot === "org-brand")
    return { ...config, dashboard: { ...config.dashboard, brandImage: value } };
  return {
    ...config,
    scenes: config.scenes.map((s) => (s.id === slot ? { ...s, image: value } : s)),
  };
}

export function getSlotAlt(config: ShowcaseConfig, slot: ImageSlotId): string {
  if (slot === "logo") return config.branding.logoAlt;
  if (slot === "org-brand") return config.dashboard.brandImageAlt;
  return config.scenes.find((s) => s.id === slot)?.alt ?? "";
}

export function setSlotAlt(
  config: ShowcaseConfig,
  slot: ImageSlotId,
  value: string,
): ShowcaseConfig {
  if (slot === "logo") return { ...config, branding: { ...config.branding, logoAlt: value } };
  if (slot === "org-brand")
    return { ...config, dashboard: { ...config.dashboard, brandImageAlt: value } };
  return {
    ...config,
    scenes: config.scenes.map((s) => (s.id === slot ? { ...s, alt: value } : s)),
  };
}
