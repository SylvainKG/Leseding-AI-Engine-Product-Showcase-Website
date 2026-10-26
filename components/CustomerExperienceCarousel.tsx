"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { DeviceFrame } from "@/components/DeviceFrame";
import { SafeImage } from "@/components/Brand";
import { MaxItConceptScene, PhoneCallScene, WebCallScene } from "@/components/scenes";
import { resolveImage, useShowcaseView } from "@/components/ShowcaseProvider";
import type { SceneId } from "@/config/showcase-config";

const DWELL_MS = 6000;
const TRANSITION_S = 0.75;

const coded: Record<SceneId, (p: { active: boolean }) => React.ReactNode> = {
  "phone-call": PhoneCallScene,
  "web-call": WebCallScene,
  "max-it-concept": MaxItConceptScene,
};

export function CustomerExperienceCarousel() {
  const { config, localImages } = useShowcaseView();
  const scenes = config.scenes;
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const paused = hovered || focused || userPaused || hidden;

  const go = useCallback((i: number) => {
    setIndex(i);
    setElapsed(0);
  }, []);

  // Advance timer — JS-driven so it also works with reduced motion.
  useEffect(() => {
    if (paused) return;
    const step = 100;
    const id = setInterval(() => setElapsed((e) => e + step), step);
    return () => clearInterval(id);
  }, [paused]);

  // Move to the next scene once the dwell time has elapsed.
  useEffect(() => {
    if (elapsed < DWELL_MS) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex((i) => (i + 1) % scenes.length);
    setElapsed(0);
  }, [elapsed, scenes.length]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Preload the next scene's image, if it uses one.
  useEffect(() => {
    const next = scenes[(index + 1) % scenes.length];
    const src = resolveImage(next.image, localImages);
    if (src) {
      const img = new window.Image();
      img.src = src;
    }
  }, [index, scenes, localImages]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go((index + 1) % scenes.length);
    else if (e.key === "ArrowLeft") go((index - 1 + scenes.length) % scenes.length);
    else return;
    e.preventDefault();
    const btn = rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    btn?.[(e.key === "ArrowRight" ? index + 1 : index - 1 + scenes.length) % scenes.length]?.focus();
  };

  const scene = scenes[index];
  const src = resolveImage(scene.image, localImages);
  const Coded = coded[scene.id];
  const dx = reduceMotion ? 0 : 18;

  return (
    <div
      ref={rootRef}
      className="flex h-full flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      aria-roledescription="carousel"
      aria-label="Customer experience scenes"
    >
      {/* Stage */}
      <div className="relative flex flex-1 items-center justify-center py-6 sm:py-8">
        <div
          className="pointer-events-none absolute inset-x-8 top-1/2 h-2/3 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand-primary) 22%, transparent), transparent)" }}
          aria-hidden="true"
        />
        <DeviceFrame>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={scene.id}
              id={`${baseId}-panel-${scene.id}`}
              role="tabpanel"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${scenes.length}: ${scene.title}`}
              className="absolute inset-0"
              initial={{ opacity: 0, x: dx }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dx }}
              transition={{ duration: TRANSITION_S, ease: [0.4, 0, 0.2, 1] }}
            >
              {src === null ? (
                <div role="img" aria-label={scene.alt} className="h-full w-full">
                  <Coded active />
                </div>
              ) : (
                <SafeImage src={src} alt={scene.alt} label={scene.title} className="h-full w-full" priority={index === 0} />
              )}
            </motion.div>
          </AnimatePresence>
        </DeviceFrame>
      </div>

      {/* Caption */}
      <div className="min-h-[64px] text-center" aria-live={paused ? "polite" : "off"}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={{ duration: 0.35 }}
          >
            <h3 className="font-display text-lg font-bold text-fg">{scene.title}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{scene.caption}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="mt-5 flex items-center gap-2">
        <div role="tablist" aria-label="Choose a scene" className="grid flex-1 grid-cols-3 gap-2" onKeyDown={onKeyDown}>
          {scenes.map((s, i) => {
            const selected = i === index;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${s.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => go(i)}
                className={`group rounded-xl border px-2.5 pb-2.5 pt-2 text-left transition-colors ${
                  selected ? "border-line-strong bg-raised" : "border-line hover:border-line-strong hover:bg-raised/60"
                }`}
              >
                <span className="flex items-baseline gap-1.5">
                  <span className={`hidden text-[11px] font-semibold tabular-nums sm:inline ${selected ? "text-primary" : "text-muted"}`}>
                    0{i + 1}
                  </span>
                  <span className={`truncate text-xs font-medium ${selected ? "text-fg" : "text-muted group-hover:text-fg"}`}>
                    {s.title}
                  </span>
                </span>
                <span className="mt-2 block h-[3px] overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: selected ? `${Math.min(100, (elapsed / DWELL_MS) * 100)}%` : "0%" }}
                  />
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          className="grid size-[52px] shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
          aria-label={userPaused ? "Resume automatic rotation" : "Pause automatic rotation"}
          aria-pressed={userPaused}
        >
          {userPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
      </div>
    </div>
  );
}
