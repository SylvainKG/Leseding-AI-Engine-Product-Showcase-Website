"use client";

import { Header } from "@/components/Header";
import { CustomerExperienceCarousel } from "@/components/CustomerExperienceCarousel";
import { AdminMonitor } from "@/components/AdminMonitor";
import { useShowcaseView } from "@/components/ShowcaseProvider";

/** Frosted-glass stage that the phone and the monitor float on. */
const glass =
  "rounded-[28px] border border-white/12 bg-white/[0.06] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.8)] backdrop-blur-2xl backdrop-saturate-150";

/**
 * The full showcase page. Reads everything from the active config view.
 *
 * On screens at least 1024 × 600 ("kiosk") the page locks to the viewport:
 * a header carrying the headline and description, then two frosted panels
 * side by side — the phone with its scene buttons, and the monitor — all
 * visible without scrolling. Smaller screens get the normal stacked page.
 */
export function ShowcaseLayout() {
  const { config, preview } = useShowcaseView();
  const b = config.branding;
  const k = (cls: string) => (preview ? "" : cls);

  const intro = (id?: string) => (
    <div>
      <h1
        id={id}
        className="font-display text-[clamp(1.9rem,min(2.4vw,4.6vh),3.1rem)] font-extrabold leading-[1.03] tracking-[-0.035em] text-fg"
      >
        {b.mainHeading}
      </h1>
      <p className="mt-3 text-[clamp(13px,1.6vh,16px)] leading-snug text-fg/80">{b.supportingCopy}</p>
    </div>
  );

  return (
    <div className={`page-glow min-h-dvh ${k("kiosk:flex kiosk:h-dvh kiosk:flex-col kiosk:overflow-hidden")}`}>
      <Header />
      <main className={`mx-auto w-full max-w-[2400px] px-3 pb-10 sm:px-4 lg:px-6 ${k("kiosk:flex kiosk:min-h-0 kiosk:flex-1 kiosk:flex-col kiosk:py-[clamp(10px,1.6vh,22px)]")}`}>
        {/* Headline on small screens only; in kiosk it lives in the header */}
        <section className={`py-8 ${k("kiosk:hidden")}`} aria-labelledby="hero-heading">
          {intro("hero-heading")}
        </section>

        <div className={`grid gap-6 ${k("kiosk:min-h-0 kiosk:flex-1 kiosk:grid-cols-[auto_minmax(0,1fr)] kiosk:gap-[clamp(14px,1.4vw,28px)]")}`}>
          <section aria-labelledby="cx-heading" className={`${glass} p-4 sm:p-6 ${k("kiosk:min-h-0 kiosk:p-[clamp(14px,2vh,28px)]")}`}>
            <h2 id="cx-heading" className="sr-only">
              {b.customerHeading}
            </h2>
            <CustomerExperienceCarousel />
          </section>

          <section aria-labelledby="org-heading" className={`${glass} flex flex-col p-3 sm:p-5 ${k("kiosk:min-h-0 kiosk:p-[clamp(12px,1.8vh,24px)]")}`}>
            <h2 id="org-heading" className="sr-only">
              {b.dashboardHeading}
            </h2>
            <AdminMonitor label={b.dashboardHeading} />
          </section>
        </div>
      </main>

      <footer className={`border-t border-line/60 ${k("kiosk:border-t-0")}`}>
        <div className={`mx-auto flex max-w-[2400px] flex-col gap-2 px-3 py-6 text-xs text-fg/60 sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:px-6 ${k("kiosk:pt-0 kiosk:pb-2.5")}`}>
          <p>{b.footerNote}</p>
          <p>{b.productName} · BlueApps Technology (Pty) Ltd</p>
        </div>
      </footer>
    </div>
  );
}
