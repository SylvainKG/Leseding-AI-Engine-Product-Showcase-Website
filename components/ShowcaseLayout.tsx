"use client";

import { Header } from "@/components/Header";
import { CustomerExperienceCarousel } from "@/components/CustomerExperienceCarousel";
import { AdminMonitor } from "@/components/AdminMonitor";
import { useShowcaseView } from "@/components/ShowcaseProvider";

function PanelHeading({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">{eyebrow}</p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-fg sm:text-[22px]">{title}</h2>
      </div>
      <p className="hidden text-right text-xs text-muted sm:block">{note}</p>
    </div>
  );
}

/** The full showcase page. Reads everything from the active config view. */
export function ShowcaseLayout() {
  const { config } = useShowcaseView();
  const b = config.branding;

  return (
    <div className="page-glow min-h-dvh">
      <Header />
      <main className="mx-auto max-w-[1640px] px-4 pb-12 sm:px-6 lg:px-8">
        <section className="pb-8 pt-10 sm:pt-14 lg:pb-10" aria-labelledby="hero-heading">
          <div className="grid items-end gap-6 lg:grid-cols-[1.1fr_1fr]">
            <h1 id="hero-heading" className="max-w-[16ch] font-display text-[clamp(2rem,4.4vw,3.6rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-fg">
              {b.mainHeading}
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-2">{b.supportingCopy}</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,41fr)_minmax(0,59fr)] lg:gap-6 2xl:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] 2xl:gap-7">
          <section aria-labelledby="cx-heading" className="flex flex-col rounded-3xl border border-line bg-surface/60 p-3.5 sm:p-6 lg:p-5 2xl:p-6">
            <div id="cx-heading">
              <PanelHeading eyebrow="For customers" title={b.customerHeading} note="Three ways to reach the agent" />
            </div>
            <div className="mt-2 flex flex-1 flex-col">
              <CustomerExperienceCarousel />
            </div>
          </section>

          <section aria-labelledby="org-heading" className="flex flex-col rounded-3xl border border-line bg-surface/60 p-3.5 sm:p-6 lg:p-5 2xl:p-6">
            <div id="org-heading">
              <PanelHeading eyebrow="For organisations" title={b.dashboardHeading} note="Click the tabs and try the controls" />
            </div>
            <div className="mt-6 flex flex-1 items-center">
              <AdminMonitor />
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1640px] flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{b.footerNote}</p>
          <p>
            {b.productName} · BlueApps Technology (Pty) Ltd
          </p>
        </div>
      </footer>
    </div>
  );
}
