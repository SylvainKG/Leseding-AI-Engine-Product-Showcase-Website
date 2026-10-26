/** A CSS-built smartphone frame. Content is rendered inside the screen. */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[min(292px,74vw)]" aria-hidden="false">
      {/* side buttons */}
      <span className="absolute -left-[3px] top-[18%] h-8 w-[3px] rounded-l bg-line-strong" aria-hidden="true" />
      <span className="absolute -left-[3px] top-[27%] h-12 w-[3px] rounded-l bg-line-strong" aria-hidden="true" />
      <span className="absolute -right-[3px] top-[24%] h-16 w-[3px] rounded-r bg-line-strong" aria-hidden="true" />
      <div
        className="relative aspect-[9/19.2] rounded-[46px] bg-bezel p-[9px] ring-1 ring-line-strong"
        style={{
          boxShadow:
            "0 40px 80px -30px color-mix(in oklab, var(--brand-primary) 35%, transparent), 0 20px 40px -20px rgb(0 0 0 / 0.6), inset 0 0 0 1.5px color-mix(in oklab, var(--text-primary) 10%, transparent)",
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[37px] bg-page">
          {children}
          {/* dynamic island */}
          <span
            className="pointer-events-none absolute left-1/2 top-2.5 z-20 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

/** Status bar shown at the top of coded phone screens. */
export function StatusBar({ tone = "fg" }: { tone?: "fg" | "contrast" }) {
  const color = tone === "fg" ? "text-fg" : "text-primary-contrast";
  return (
    <div className={`relative z-10 flex items-center justify-between px-7 pt-3.5 text-[11px] font-semibold ${color}`}>
      <span>9:41</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        <svg viewBox="0 0 18 12" className="h-2.5 w-auto fill-current">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 26 12" className="h-2.5 w-auto">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.5" />
          <rect x="2" y="2" width="16" height="8" rx="1.8" fill="currentColor" />
          <rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  );
}
