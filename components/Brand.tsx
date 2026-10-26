"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveImage, useShowcaseView } from "@/components/ShowcaseProvider";

/** Built-in placeholder mark, used until the official logo is supplied. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--brand-primary)" />
      <path
        d="M10 26a10 10 0 0 1 20 0"
        fill="none"
        stroke="var(--brand-primary-contrast)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <g stroke="var(--brand-secondary)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M20 9.5v3.2" />
        <path d="M9.6 13.8l2.2 2.2" />
        <path d="M30.4 13.8l-2.2 2.2" />
      </g>
      <g stroke="var(--brand-primary-contrast)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M16 30.5h8" />
      </g>
    </svg>
  );
}

/** Logo from config (image) or the built-in mark + wordmark. */
export function Logo({ compact = false }: { compact?: boolean }) {
  const { config, localImages } = useShowcaseView();
  const src = resolveImage(config.branding.logo, localImages);
  const [failed, setFailed] = useState<string | null>(null);

  if (src && failed !== src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={config.branding.logoAlt || config.branding.productName}
        className="h-9 w-auto max-w-[200px] object-contain"
        onError={() => setFailed(src)}
      />
    );
  }
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="whitespace-nowrap font-display text-[15px] font-bold leading-tight tracking-tight text-fg">
          {config.branding.productName}
        </span>
      )}
    </span>
  );
}

/**
 * An image with a designed fallback when the URL is missing or fails to load.
 */
export function SafeImage({
  src,
  alt,
  label,
  fit = "cover",
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  label: string;
  fit?: "cover" | "contain";
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <div
        role="img"
        aria-label={`${label} — image unavailable`}
        className={`flex flex-col items-center justify-center gap-2 bg-sunken text-center text-muted ${className}`}
      >
        <ImageOff className="size-6" aria-hidden="true" />
        <span className="px-4 text-xs font-medium">{label}</span>
        <span className="px-6 text-[10px] opacity-80">Image could not be loaded</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(src)}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
    />
  );
}
