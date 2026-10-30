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

/** Phone scenes, with the scene buttons and caption underneath. */
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
      className="flex h-full flex-col gap-4 kiosk:gap-[clamp(10px,1.4vh,18px)]"
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
      <div className="relative flex items-center justify-center py-2 kiosk:min-h-0 kiosk:flex-1 kiosk:py-0">
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

      {/* Scene buttons + caption */}
      <div className="shrink-0">
        <div className="flex items-stretch gap-1.5">
          <div role="tablist" aria-label="Choose a scene" className="grid flex-1 grid-cols-3 gap-1.5" onKeyDown={onKeyDown}>
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
                  title={s.title}
                  className={`relative overflow-hidden rounded-lg border px-2 py-2 text-center transition-colors ${
                    selected ? "border-white/25 bg-white/14" : "border-white/8 bg-white/[0.03] hover:bg-white/8"
                  }`}
                >
                  <span className={`block truncate text-[13px] font-semibold ${selected ? "text-fg" : "text-fg/70"}`}>{s.title}</span>
                  <span className="absolute inset-x-0 bottom-0 block h-[2px]" aria-hidden="true">
                    <span className="block h-full bg-fg/80" style={{ width: selected ? `${Math.min(100, (elapsed / DWELL_MS) * 100)}%` : "0%" }} />
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            className="grid w-9 shrink-0 place-items-center rounded-lg border border-white/8 bg-white/[0.03] text-fg/70 transition-colors hover:bg-white/8 hover:text-fg"
            aria-label={userPaused ? "Resume automatic rotation" : "Pause automatic rotation"}
            aria-pressed={userPaused}
          >
            {userPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        </div>
        <p className="mt-2 truncate text-center text-[13px] text-fg/70" aria-live={paused ? "polite" : "off"}>
          {scene.caption}
        </p>
      </div>
    </div>
  );
}
