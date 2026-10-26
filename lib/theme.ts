import type { ThemeConfig } from "@/config/showcase-config";

/** Maps each theme token to the CSS custom property components read. */
export const themeVarMap: Record<keyof ThemeConfig, string> = {
  primary: "--brand-primary",
  primaryContrast: "--brand-primary-contrast",
  secondary: "--brand-secondary",
  background: "--page-background",
  surface: "--surface",
  text: "--text-primary",
  mutedText: "--text-muted",
  border: "--border",
  success: "--success",
  warning: "--warning",
};

/** CSS variables for a theme, usable as an inline `style` (scoped previews). */
export function themeToStyle(theme: ThemeConfig): Record<string, string> {
  const style: Record<string, string> = {};
  (Object.keys(themeVarMap) as Array<keyof ThemeConfig>).forEach((k) => {
    style[themeVarMap[k]] = theme[k];
  });
  return style;
}

/** Applies a theme globally by setting variables on <html>. */
export function applyTheme(theme: ThemeConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(themeToStyle(theme)).forEach(([k, v]) => root.style.setProperty(k, v));
}

/**
 * A tiny inline script that applies a saved theme before first paint, so a
 * customised browser never flashes the default colours.
 */
export function themeBootScript(storageKey: string): string {
  return `(function(){try{var c=JSON.parse(localStorage.getItem(${JSON.stringify(
    storageKey,
  )})||"null");if(!c||!c.theme)return;var m=${JSON.stringify(
    themeVarMap,
  )};var r=document.documentElement.style;for(var k in m){var v=c.theme[k];if(typeof v==="string"&&/^#[0-9a-fA-F]{6}$/.test(v))r.setProperty(m[k],v);}}catch(e){}})();`;
}
