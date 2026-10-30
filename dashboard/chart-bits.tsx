"use client";

type Payload = { name?: string; value?: number | string; color?: string; stroke?: string; fill?: string };

/** Theme-aware tooltip for Recharts. */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: Payload[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line-strong bg-raised px-2.5 py-1.5 text-[12px] shadow-lg">
      <p className="mb-1 font-semibold text-fg">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 text-muted">
          <span className="size-2 rounded-full" style={{ background: p.stroke ?? p.color ?? p.fill }} aria-hidden="true" />
          {p.name} <span className="ml-auto pl-3 font-medium tabular-nums text-fg">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}
