"use client";

import { Logo } from "@/components/Brand";
import { CustomizeButton } from "@/components/CustomizeButton";
import { useShowcaseView } from "@/components/ShowcaseProvider";

export function Header() {
  const { config, preview } = useShowcaseView();
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-page/80 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1640px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Logo />
          <span className="hidden h-5 w-px bg-line lg:block" aria-hidden="true" />
          <p className="hidden truncate text-sm text-muted lg:block">{config.branding.tagline}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-medium text-muted sm:inline-flex">
            <span className="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
            Interactive showcase
          </span>
          {!preview && <CustomizeButton />}
        </div>
      </div>
    </header>
  );
}
