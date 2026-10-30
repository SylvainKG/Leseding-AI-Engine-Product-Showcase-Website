"use client";

import { Logo } from "@/components/Brand";
import { CustomizeButton } from "@/components/CustomizeButton";
import { useShowcaseView } from "@/components/ShowcaseProvider";

/**
 * Site header. In the single-screen (kiosk) layout it also carries the page
 * headline and description, so they cost no width next to the phone and monitor.
 */
export function Header() {
  const { config, preview } = useShowcaseView();
  const b = config.branding;
  const kiosk = !preview;
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-page/70 backdrop-blur-xl kiosk:static">
      <div
        className={`mx-auto flex h-[60px] max-w-[2400px] items-center justify-between gap-4 px-3 sm:px-4 lg:px-6 ${
          kiosk ? "kiosk:h-[clamp(64px,8vh,84px)] kiosk:gap-[clamp(16px,2vw,40px)]" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-4 kiosk:gap-[clamp(14px,1.6vw,28px)]">
          <Logo />
          <span className="hidden h-8 w-px bg-white/15 lg:block" aria-hidden="true" />
          {kiosk ? (
            <>
              <p className="hidden truncate text-sm text-muted lg:block kiosk:hidden">{b.tagline}</p>
              <h1
                id="hero-heading-kiosk"
                className="hidden whitespace-nowrap font-display text-[clamp(20px,min(1.75vw,3.2vh),34px)] font-extrabold tracking-[-0.03em] text-fg kiosk:block"
              >
                {b.mainHeading}
              </h1>
            </>
          ) : (
            <p className="hidden truncate text-sm text-muted lg:block">{b.tagline}</p>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-4">
          {kiosk && (
            <p className="hidden max-w-[min(40vw,640px)] text-[clamp(12px,1.45vh,15px)] leading-snug text-fg/75 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden min-[1280px]:kiosk:block">
              {b.supportingCopy}
            </p>
          )}
          {!kiosk && (
            <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-medium text-muted sm:inline-flex">
              <span className="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
              Interactive showcase
            </span>
          )}
          {!preview && <CustomizeButton />}
        </div>
      </div>
    </header>
  );
}
