import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

export function CustomizeButton() {
  return (
    <Link
      href="/customize"
      title="Customize"
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg transition-colors hover:border-line-strong hover:bg-raised"
    >
      <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only min-[1280px]:max-[1535px]:kiosk:sr-only">Customize</span>
    </Link>
  );
}
