/**
 * Browser-local persistence.
 *
 * - The configuration (colours, labels, image references) lives in localStorage
 *   under STORAGE_KEY with a version field for future migrations.
 * - Uploaded images are stored as Blobs in IndexedDB (not base64 in
 *   localStorage), and the config refers to them as "idb:<slot>".
 *
 * Nothing here is shared between devices or visitors.
 */
import { STORAGE_KEY, type ShowcaseConfig } from "@/config/showcase-config";
import { validateConfig } from "@/lib/config-validation";

export function loadStoredConfig(): ShowcaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = validateConfig(parsed);
    return result.ok ? result.config : null;
  } catch {
    return null;
  }
}

export function saveStoredConfig(config: ShowcaseConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

/* ---------------- IndexedDB image store ---------------- */

const DB_NAME = "leseding-showcase-assets";
const STORE = "images";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB unavailable"));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    t.onerror = () => {
      db.close();
      reject(t.error);
    };
  });
}

export type StoredImage = { blob: Blob; name: string };

export function putImage(slot: string, image: StoredImage) {
  return tx("readwrite", (s) => s.put(image, slot));
}

export async function getImage(slot: string): Promise<StoredImage | null> {
  try {
    return ((await tx("readonly", (s) => s.get(slot))) as StoredImage | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function deleteImage(slot: string) {
  try {
    await tx("readwrite", (s) => s.delete(slot));
  } catch {
    /* ignore */
  }
}

export async function clearImages() {
  try {
    await tx("readwrite", (s) => s.clear());
  } catch {
    /* ignore */
  }
}
