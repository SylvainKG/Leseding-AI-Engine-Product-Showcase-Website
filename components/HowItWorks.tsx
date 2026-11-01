"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play, X } from "lucide-react";
import { FlowDiagram, LOOP_MS, STEP_STARTS, stepAt, tallLayout, wideLayout } from "@/components/FlowDiagram";
import { useShowcaseView } from "@/components/ShowcaseProvider";
import { howItWorksCopy as copy, type FlowOutcome } from "@/config/how-it-works";

/**
 * Header button that opens the animated "how it works" flow — a visual a
 * presenter can talk over at the stall. It loops on its own; steps can be
 * clicked to jump, and the ending can be pinned to either outcome.
 *
 * </ABM>
 */

type Ending = "alternate" | FlowOutcome;

/** Portrait screens get the top-to-bottom diagram. */
const TALL_QUERY = "(max-aspect-ratio: 1/1)";

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Small looping voice wave, used as the button's icon. */
function MiniWave() {
  return (
    <span className="flex h-4 items-center gap-[2px]" aria-hidden="true">
      {[0.55, 1, 0.7, 0.9].map((h, i) => (
        <span
          key={i}
          className="w-[2.5px] origin-center rounded-full bg-current animate-wave"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.14}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

export function HowItWorksButton() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // A native modal dialog: top layer (escapes the header's backdrop blur),
  // focus is kept inside, Esc closes, and focus returns to this button.
  // No backdrop-filter on it: blurring the animated page behind every frame
  // is expensive on modest exhibition laptops.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-contrast shadow-[0_6px_20px_-8px_var(--brand-primary)] transition-colors hover:bg-primary-hover active:bg-primary-active"
      >
        <MiniWave />
        <span className="whitespace-nowrap max-[399px]:sr-only">{copy.button}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="flow-dialog m-auto h-[min(1000px,calc(100dvh-24px))] max-h-none w-[min(1760px,calc(100vw-24px))] max-w-none overflow-hidden rounded-[24px] border border-white/12 bg-page bg-[radial-gradient(120%_70%_at_50%_0%,color-mix(in_oklab,var(--brand-primary)_12%,transparent),transparent)] p-0 text-fg shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] backdrop:bg-black/70 sm:rounded-[28px]"
      >
        {open && <FlowPanel titleId={titleId} onClose={() => setOpen(false)} />}
      </dialog>
    </>
  );
}

function FlowPanel({ titleId, onClose }: { titleId: string; onClose: () => void }) {
  const { config } = useShowcaseView();
  const name = config.branding.productName;
  const reduced = useReducedMotion() ?? false;
  const tall = useMediaQuery(TALL_QUERY);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [ending, setEnding] = useState<Ending>("alternate");

  // One clock drives both the diagram and the captions.
  useEffect(() => {
    if (!playing || hidden) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null) {
        const dt = Math.min(now - last, 250);
        setElapsed((e) => e + dt);
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, hidden]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const loop = Math.floor(elapsed / LOOP_MS);
  const t = elapsed - loop * LOOP_MS;
  const outcome: FlowOutcome = ending === "alternate" ? (loop % 2 === 0 ? "ai" : "human") : ending;
  const { step, progress } = stepAt(t);
  const steps = [...copy.steps, copy.outcomes[outcome]];
  const current = steps[step];

  return (
    <div className="flex h-full flex-col">
      {/* Title bar */}
      <div className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="min-w-0">
          <h2 id={titleId} className="font-display text-[clamp(18px,min(2vw,3.4vh),28px)] font-extrabold leading-tight tracking-[-0.03em] text-fg">
            How {name} works
          </h2>
          <p className="mt-1 text-[clamp(12.5px,1.5vh,15px)] text-fg/70 max-sm:hidden">{copy.intro}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause animation" : "Play animation"}
            className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-fg/80 transition-colors hover:bg-white/10 hover:text-fg"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-fg/80 transition-colors hover:bg-white/10 hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Diagram */}
      <div className="min-h-0 flex-1 px-2 py-2 sm:px-6 sm:py-3">
        <FlowDiagram
          layout={tall ? tallLayout : wideLayout}
          t={t}
          clock={elapsed}
          outcome={outcome}
          reduced={reduced}
          engineName={name}
          className="h-full w-full"
        />
      </div>

      {/* Steps + caption */}
      <div className="shrink-0 border-t border-white/10 bg-white/[0.03] px-4 pb-4 pt-3 sm:px-6 sm:pb-5">
        <ol className="grid grid-cols-5 gap-1.5" aria-label="Steps">
          {steps.map((s, i) => {
            const on = i === step;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setElapsed(loop * LOOP_MS + STEP_STARTS[i])}
                  aria-current={on ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  title={s.title}
                  className={`relative flex w-full items-center gap-2 overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-colors ${
                    on ? "border-white/25 bg-white/12" : "border-white/8 bg-white/[0.02] hover:bg-white/8"
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums transition-colors ${
                      on ? "bg-secondary text-page" : i < step ? "bg-secondary/25 text-fg" : "bg-white/10 text-fg/70"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`hidden truncate text-[13px] font-semibold lg:block ${on ? "text-fg" : "text-fg/65"}`}>{s.title}</span>
                  <span className="absolute inset-x-0 bottom-0 h-[2px]" aria-hidden="true">
                    <span className="block h-full bg-secondary" style={{ width: on ? `${Math.min(100, progress * 100)}%` : i < step ? "100%" : "0%", opacity: on ? 1 : 0.35 }} />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
          <p className="min-h-[2.6em] text-[clamp(14px,min(1.5vw,2.3vh),20px)] leading-snug text-fg" aria-live={playing ? "off" : "polite"}>
            <span className="font-semibold text-secondary">{current.title}. </span>
            {current.text}
          </p>

          <div role="group" aria-label={copy.endingLabel} className="flex shrink-0 items-center gap-2">
            <span className="text-[12px] font-medium text-fg/60 max-sm:sr-only">{copy.endingLabel}</span>
            <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
              {(Object.keys(copy.endings) as Ending[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={ending === key}
                  onClick={() => setEnding(key)}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[12.5px] font-medium transition-colors ${
                    ending === key ? "bg-white/14 text-fg" : "text-fg/65 hover:text-fg"
                  }`}
                >
                  {copy.endings[key]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
