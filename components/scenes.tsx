"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Grid3x3,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Lock,
  Phone,
  Send,
  Smartphone,
  Wallet,
  Wifi,
  Zap,
  Gift,
  Home,
  Search,
  User,
  MessageCircle,
} from "lucide-react";
import { LogoMark } from "@/components/Brand";
import { StatusBar } from "@/components/DeviceFrame";

/* Shared bits ---------------------------------------------------------- */

function Waveform({ bars = 22, active = true, className = "" }: { bars?: number; active?: boolean; className?: string }) {
  return (
    <div className={`flex h-10 items-center justify-center gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 30 + ((i * 37) % 70);
        return (
          <span
            key={i}
            className={`w-[3px] origin-center rounded-full bg-current ${active ? "animate-wave" : ""}`}
            style={{ height: `${h}%`, animationDelay: `${(i % 7) * 0.11}s`, opacity: 0.5 + ((i * 13) % 50) / 100 }}
          />
        );
      })}
    </div>
  );
}

function useTicker(active: boolean, intervalMs: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => {
      clearInterval(id);
      setTick(0);
    };
  }, [active, intervalMs]);
  return tick;
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* Scene A — Normal phone call ------------------------------------------ */

const callCaptions = [
  { who: "agent", text: "Dumela! You've reached Leseding AI Support. How can I help today?" },
  { who: "caller", text: "How can I check my account balance?" },
  { who: "agent", text: "I can guide you through the available options." },
];

export function PhoneCallScene({ active }: { active: boolean }) {
  const seconds = useTicker(active, 1000);
  const caption = callCaptions[Math.floor(seconds / 3) % callCaptions.length];

  return (
    <div
      className="flex h-full flex-col"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--brand-primary) 30%, var(--page-background)) 0%, var(--page-background) 62%)",
      }}
    >
      <StatusBar />
      <div className="mt-10 flex flex-col items-center px-6 text-center">
        <div className="relative grid size-[88px] place-items-center">
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ring" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ring [animation-delay:1.2s]" aria-hidden="true" />
          <span className="relative grid size-[88px] place-items-center rounded-full bg-surface ring-1 ring-line-strong">
            <LogoMark className="size-12" />
          </span>
        </div>
        <p className="mt-5 font-display text-[19px] font-bold text-fg">Leseding AI Support</p>
        <p className="mt-1 text-[12px] text-muted">Call connected — demo</p>
        <p className="mt-2 font-mono text-[15px] tabular-nums text-fg" aria-label={`Call duration ${fmt(seconds)} (demo)`}>
          {fmt(seconds)}
        </p>
      </div>

      <Waveform className="mt-5 text-primary" active={active} />

      <div className="mx-5 mt-4 min-h-[72px] rounded-2xl border border-line bg-surface/70 px-3.5 py-3 backdrop-blur">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
          {caption.who === "agent" ? "Leseding AI" : "Caller"} · live caption (demo)
        </p>
        <p className="mt-1 text-[12px] leading-snug text-fg">{caption.text}</p>
      </div>

      {/* Visual-only call controls */}
      <div className="mt-auto grid grid-cols-3 gap-y-4 px-8 pb-9" aria-hidden="true">
        {[
          { icon: MicOff, label: "Mute" },
          { icon: Grid3x3, label: "Keypad" },
          { icon: Volume2, label: "Speaker" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span className="grid size-12 place-items-center rounded-full bg-fg/10 text-fg">
              <Icon className="size-5" />
            </span>
            <span className="text-[10px] text-muted">{label}</span>
          </div>
        ))}
        <div className="col-span-3 flex justify-center pt-1">
          <span className="grid size-14 place-items-center rounded-full bg-danger text-white">
            <PhoneOff className="size-6" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* Scene B — Web call ---------------------------------------------------- */

const webStates = [
  { key: "listening", label: "Listening…", line: "How can I check my account balance?", who: "You" },
  { key: "thinking", label: "Finding an answer…", line: "", who: "" },
  { key: "speaking", label: "Speaking", line: "I can guide you through the available options.", who: "Leseding AI" },
] as const;

export function WebCallScene({ active }: { active: boolean }) {
  const tick = useTicker(active, 1900);
  const state = webStates[tick % webStates.length];

  return (
    <div className="flex h-full flex-col bg-page">
      <StatusBar />
      {/* browser chrome */}
      <div className="mx-3 mt-2 flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-[10px] text-muted ring-1 ring-line">
        <Lock className="size-3" aria-hidden="true" />
        <span className="truncate">Leseding AI web call · demo page</span>
      </div>

      <div className="flex items-center gap-2 px-5 pt-5">
        <LogoMark className="size-7" />
        <div>
          <p className="font-display text-[13px] font-bold leading-tight text-fg">Leseding AI</p>
          <p className="text-[10px] text-muted">Web call</p>
        </div>
        <span className="ml-auto rounded-full border border-line px-2 py-0.5 text-[9px] font-medium text-muted">
          Demo conversation
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="font-display text-[22px] font-bold leading-tight text-fg text-center">Talk to Leseding AI</p>
        <p className="mt-1.5 text-center text-[11px] text-muted">Speak naturally, in English or Setswana.</p>

        <div className="relative mt-8 grid size-36 place-items-center">
          {state.key !== "thinking" && (
            <>
              <span className="absolute inset-3 rounded-full bg-primary/30 animate-ring" aria-hidden="true" />
              <span className="absolute inset-3 rounded-full bg-primary/25 animate-ring [animation-delay:1.2s]" aria-hidden="true" />
            </>
          )}
          <span
            className="relative grid size-28 place-items-center rounded-full text-primary-contrast"
            style={{
              background:
                state.key === "speaking"
                  ? "radial-gradient(circle at 35% 30%, var(--brand-secondary), var(--brand-primary) 70%)"
                  : "radial-gradient(circle at 35% 30%, var(--primary-hover), var(--brand-primary) 70%)",
              boxShadow: "0 18px 50px -12px color-mix(in oklab, var(--brand-primary) 70%, transparent)",
            }}
            aria-hidden="true"
          >
            {state.key === "speaking" ? (
              <Waveform bars={9} className="h-9 text-primary-contrast" />
            ) : (
              <Mic className={`size-10 ${state.key === "thinking" ? "animate-pulse-soft" : ""}`} />
            )}
          </span>
        </div>
        <p className="mt-6 text-[12px] font-semibold text-fg" aria-live="off">
          {state.label}
        </p>
      </div>

      <div className="mx-4 mb-4 min-h-[64px] rounded-2xl border border-line bg-surface px-3.5 py-3">
        {state.line ? (
          <>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">{state.who}</p>
            <p className="mt-1 text-[12px] leading-snug text-fg">{state.line}</p>
          </>
        ) : (
          <div className="flex h-full items-center gap-1.5 pt-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 rounded-full bg-muted animate-pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-3 pb-7" aria-hidden="true">
        <span className="flex h-10 items-center gap-2 rounded-full bg-danger px-5 text-[12px] font-semibold text-white">
          <PhoneOff className="size-4" /> End call
        </span>
      </div>
    </div>
  );
}

/* Scene C — Max it in-app concept --------------------------------------- */

export function MaxItConceptScene({ active }: { active: boolean }) {
  const tick = useTicker(active, 2200);
  const showReply = tick % 3 !== 0;

  return (
    <div className="relative flex h-full flex-col bg-page">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <p className="text-[10px] text-muted">Dumela,</p>
          <p className="font-display text-[15px] font-bold text-fg">Neo</p>
        </div>
        <span className="rounded-full border border-secondary/50 bg-secondary/10 px-2 py-0.5 text-[9px] font-semibold text-secondary">
          Illustrative concept
        </span>
      </div>

      <div className="mx-5 mt-3 rounded-2xl border border-line bg-surface p-3.5">
        <p className="text-[10px] text-muted">Wallet (sample)</p>
        <p className="mt-0.5 font-display text-[18px] font-bold tracking-tight text-fg">P ••••.••</p>
        <div className="mt-2.5 flex gap-2">
          {["Send", "Pay", "Top up"].map((l) => (
            <span key={l} className="rounded-lg bg-fg/8 px-2.5 py-1 text-[10px] font-medium text-fg">
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-5 mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
        {[
          { icon: Smartphone, l: "Airtime" },
          { icon: Wifi, l: "Data" },
          { icon: Zap, l: "Power" },
          { icon: Gift, l: "Offers" },
        ].map(({ icon: Icon, l }) => (
          <div key={l} className="flex flex-col items-center gap-1 rounded-xl bg-surface py-2 ring-1 ring-line">
            <Icon className="size-4 text-muted" />
            <span className="text-[9px] text-muted">{l}</span>
          </div>
        ))}
      </div>

      {/* Assistant sheet */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[26px] border-t border-line-strong bg-raised px-4 pb-16 pt-2.5"
        style={{ boxShadow: "0 -20px 40px -16px rgb(0 0 0 / 0.5)" }}
      >
        <span className="mx-auto block h-1 w-9 rounded-full bg-line-strong" aria-hidden="true" />
        <div className="mt-2.5 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-contrast">
            <Bot className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-bold leading-tight text-fg">Support assistant</p>
            <p className="text-[9px] text-muted">Powered by Leseding AI · concept</p>
          </div>
          <span className="ml-auto grid size-8 place-items-center rounded-full bg-success text-white" aria-hidden="true">
            <Phone className="size-3.5" />
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-[11px] text-primary-contrast">
            Why is my data bundle not working?
          </div>
          <div
            className={`w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-surface px-3 py-2 text-[11px] text-fg ring-1 ring-line transition-opacity duration-500 ${
              showReply ? "opacity-100" : "opacity-0"
            }`}
          >
            Let&apos;s check together. You can also tap the call button to talk it through.
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-[10px] text-muted" aria-hidden="true">
          <MessageCircle className="size-3.5" />
          <span className="flex-1">Type or tap to talk…</span>
          <Send className="size-3.5 text-primary" />
        </div>
      </div>

      {/* tab bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-line bg-surface px-6 pb-4 pt-2" aria-hidden="true">
        {[Home, Search, Wallet, User].map((Icon, i) => (
          <Icon key={i} className={`size-4 ${i === 0 ? "text-primary" : "text-muted"}`} />
        ))}
      </div>
    </div>
  );
}
