"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { defaultConfig, type ShowcaseConfig } from "@/config/showcase-config";
import {
  clearImages,
  clearStoredConfig,
  deleteImage,
  getImage,
  loadStoredConfig,
  putImage,
  saveStoredConfig,
  type StoredImage,
} from "@/lib/config-storage";
import { applyTheme } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/* View context: what a rendered showcase reads (config + image URLs). */
/* The /customize live preview overrides it with the unsaved draft.    */
/* ------------------------------------------------------------------ */

type ViewValue = {
  config: ShowcaseConfig;
  /** Object URLs for browser-local images, keyed by slot id. */
  localImages: Record<string, string>;
  /** True inside the /customize preview. */
  preview?: boolean;
};

const ViewContext = createContext<ViewValue>({ config: defaultConfig, localImages: {} });

export function ConfigView({ value, children }: { value: ViewValue; children: React.ReactNode }) {
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useShowcaseView() {
  return useContext(ViewContext);
}

/**
 * Resolves an image reference to a URL.
 * Returns null for "" (use the built-in mockup), and "" for a reference that
 * cannot be resolved (caller shows a placeholder).
 */
export function resolveImage(ref: string, localImages: Record<string, string>): string | null {
  if (!ref) return null;
  if (ref.startsWith("idb:")) return localImages[ref.slice(4)] ?? "";
  return ref;
}

/* ------------------------------------------------------------------ */
/* Store context: saved config, persistence, save / reset.             */
/* ------------------------------------------------------------------ */

type StoreValue = {
  config: ShowcaseConfig;
  localImages: Record<string, string>;
  localImageMeta: Record<string, { name: string; type: string }>;
  hydrated: boolean;
  /** Saves config; `images` maps slot → new image (or null to delete). */
  save: (config: ShowcaseConfig, images?: Record<string, StoredImage | null>) => Promise<boolean>;
  reset: () => Promise<void>;
  getLocalBlob: (slot: string) => Promise<StoredImage | null>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function useShowcaseStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useShowcaseStore must be used inside ShowcaseProvider");
  return ctx;
}

const SLOTS = ["logo", "phone-call", "web-call", "max-it-concept", "org-brand"];

export function ShowcaseProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ShowcaseConfig>(defaultConfig);
  const [localImages, setLocalImages] = useState<Record<string, string>>({});
  const [localImageMeta, setLocalImageMeta] = useState<Record<string, { name: string; type: string }>>({});
  const [hydrated, setHydrated] = useState(false);
  const urlsRef = useRef<Record<string, string>>({});

  const loadImages = useCallback(async () => {
    const urls: Record<string, string> = {};
    const meta: Record<string, { name: string; type: string }> = {};
    for (const slot of SLOTS) {
      const img = await getImage(slot);
      if (img) {
        urls[slot] = URL.createObjectURL(img.blob);
        meta[slot] = { name: img.name, type: img.blob.type };
      }
    }
    Object.values(urlsRef.current).forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = urls;
    setLocalImages(urls);
    setLocalImageMeta(meta);
  }, []);

  useEffect(() => {
    const stored = loadStoredConfig();
    // Hydrating from browser storage after mount is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setConfig(stored);
    loadImages().finally(() => setHydrated(true));
    const urls = urlsRef;
    return () => Object.values(urls.current).forEach((u) => URL.revokeObjectURL(u));
  }, [loadImages]);

  useEffect(() => {
    applyTheme(config.theme);
  }, [config.theme]);

  const save = useCallback<StoreValue["save"]>(
    async (next, images = {}) => {
      try {
        for (const [slot, img] of Object.entries(images)) {
          if (img) await putImage(slot, img);
          else await deleteImage(slot);
        }
      } catch {
        return false;
      }
      const ok = saveStoredConfig(next);
      if (!ok) return false;
      setConfig(next);
      await loadImages();
      return true;
    },
    [loadImages],
  );

  const reset = useCallback(async () => {
    clearStoredConfig();
    await clearImages();
    setConfig(defaultConfig);
    await loadImages();
  }, [loadImages]);

  const store = useMemo<StoreValue>(
    () => ({ config, localImages, localImageMeta, hydrated, save, reset, getLocalBlob: getImage }),
    [config, localImages, localImageMeta, hydrated, save, reset],
  );

  return (
    <StoreContext.Provider value={store}>
      <ConfigView value={{ config, localImages }}>{children}</ConfigView>
    </StoreContext.Provider>
  );
}
