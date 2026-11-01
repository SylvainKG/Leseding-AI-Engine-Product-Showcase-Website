# Leseding AI Engine — Interactive Showcase

A single-page, interactive product showcase for **Leseding AI Engine**, built for exhibition visitors, partners and decision-makers. It shows two sides of the product:

- **Customer Experience** — three auto-rotating scenes in a phone frame: a normal phone call, a web call, and an illustrative in-app (Max it) concept.
- **Organisation Dashboard** — a simulated admin dashboard inside a desktop-monitor frame with six working tabs (Overview, AI Agent, Knowledge Base, Conversations, Analytics, Organisation Settings).

A separate **`/customize`** page lets a presenter change brand colours, images and text labels without touching code.

> Everything on the dashboard is front-end simulation with fictional sample data. No control talks to a live Leseding AI system.

Specification: [`leseding_ai_engine_showcase_developer_guide.md`](./leseding_ai_engine_showcase_developer_guide.md)

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + React 19 |
| Styling | Tailwind CSS v4 + CSS custom properties (design tokens) |
| Animation | Motion for React (`motion`) |
| Icons | Lucide React |
| Charts | Recharts |
| Fonts | Inter + Manrope (self-hosted via Fontsource, no external requests) |
| Hosting | Vercel (fully static — both routes prerender) |

No backend, database, API keys or environment variables are required.

## Run locally

Requires **Node.js 20.9 or newer**.

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build (run this before deploying)
npm run start        # serve the production build
npm run lint
npm run typecheck
```

## Project structure

```text
app/
  layout.tsx            Root layout, theme boot script, ShowcaseProvider
  page.tsx              "/"  — main showcase
  customize/page.tsx    "/customize" — customization page
  globals.css           Design tokens + Tailwind theme mapping
  icon.svg              Favicon
components/
  ShowcaseProvider.tsx  Shared config/state layer (persistence, save, reset)
  ShowcaseLayout.tsx    Main page composition (header, hero, two panels, footer)
  Header.tsx, CustomizeButton.tsx, Brand.tsx (logo + image fallback)
  HowItWorks.tsx        Header "How it works" button + dialog (steps, pause, ending picker)
  FlowDiagram.tsx       Animated flow diagram (voice wave along the call path)
  CustomerExperienceCarousel.tsx, DeviceFrame.tsx, scenes.tsx
  AdminMonitor.tsx      Monitor frame, sidebar/tab navigation, toast region
  CustomizeEditor.tsx   /customize page logic
  ThemeEditor.tsx, ImageAssetEditor.tsx, LivePreview.tsx
dashboard/
  state.tsx             Simulated dashboard state (reducer, save/cancel, reset demo)
  ui.tsx                Small UI kit (Card, Badge, Button, Toggle, inputs…)
  OverviewTab.tsx, AgentTab.tsx, KnowledgeBaseTab.tsx,
  ConversationsTab.tsx, AnalyticsTab.tsx, SettingsTab.tsx
config/
  showcase-config.ts    ★ Default colours, labels and image paths (single source of truth)
  demo-data.ts          Fictional dashboard data
  how-it-works.ts       Labels and captions for the "How it works" flow
lib/
  config-validation.ts  Hex normalisation, contrast ratios, config/JSON validation
  config-storage.ts     localStorage (config) + IndexedDB (uploaded images)
  theme.ts              Token → CSS variable mapping, applyTheme, boot script
  export-import.ts      Export/import JSON, file downloads
public/
  logo/                 Official logo goes here
  showcase/             Scene images go here
```

## "How it works" flow

The **How it works** button in the header opens an animated version of the pitch-deck "Functionality" slide, for presenters to talk over at the stall:

- A voice wave leaves the customer, becomes text after **Speech to text**, visits the **Reasoning brain** and the **Client knowledge base**, and becomes a voice again after **Response** — then ends at either **Leseding AI responds** or **Human agent**. It loops on its own (~16 s per loop).
- The ending **alternates** each loop by default; the *Ending* picker pins it to one outcome. Click a numbered step to jump to it; the pause button freezes it on a step. Esc or clicking outside closes it.
- Wording lives in `config/how-it-works.ts`. Timing (`STAGES`) and node positions (`wideLayout` for landscape screens, `tallLayout` for portrait phones) live in `components/FlowDiagram.tsx`.
- Colours come from the theme tokens (the wave and lit path use the secondary colour), so it follows `/customize`. With reduced motion, the steps advance without the moving wave.

## How theming works

- All brand colours live in `config/showcase-config.ts` → `defaultConfig.theme`.
- They are applied as CSS variables (`--brand-primary`, `--surface`, `--text-primary`, `--border`, …) and mapped to Tailwind colours (`bg-primary`, `text-muted`, `border-line`, …) in `app/globals.css`.
- Hover/active/raised/sunken shades are **derived** from those tokens with `color-mix()`, so any palette stays consistent.
- Components never contain raw brand hex values.

## Customization and persistence

On `/customize` a presenter can edit the 12 colour tokens (picker + hex input with validation and contrast checks), replace 5 image slots (logo, three scenes, organisation brand preview), and edit headings, captions and the footer disclaimer — with a live preview of the real page.

**Where changes are stored (per browser only):**

| What | Where |
|---|---|
| Colours, text, image references | `localStorage` key `leseding-showcase-config-v1` (versioned) |
| Uploaded images (PNG/JPG/WebP ≤ 5 MB) | IndexedDB database `leseding-showcase-assets` (Blobs, not base64) |

Saved changes do **not** change what other visitors or devices see. A small inline script applies a saved theme before first paint so a customised browser doesn't flash the default colours.

**Reset to defaults** clears both stores. The dashboard's own **Reset demo** button restores sample data and settings (that state is in memory only).

### Image fields

Each image value in the config can be:

- `""` — use the built-in coded mockup (scenes) or placeholder mark (logo)
- `"/showcase/phone-call.webp"` — a file in `/public`
- `"https://…"` — a publicly reachable URL
- `"idb:<slot>"` — an image uploaded on `/customize` (this browser only)

Missing or broken images show a designed placeholder instead of a broken-image icon.

## Publishing changes for all visitors

1. Preview and save colours, labels and images on `/customize`.
2. Go to **Export / import → Export configuration** (downloads `leseding-showcase-config.json`). Uploaded images are listed under `assetsToPlace` with the path to save them at.
3. On the **Images** tab, use **Download** on each uploaded image and place it in `public/showcase/` (logo in `public/logo/`).
4. Copy the values from the JSON into `config/showcase-config.ts`.
5. Commit and push — Vercel redeploys automatically.
6. Check the public URL in a private/incognito window.

If non-developers need to update the live site from any device without redeploying, that needs an authenticated shared config store or CMS — a separate phase, not part of this build.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repository. The Next.js preset needs no changes (build `next build`, no env vars).
3. Deploy, then check `/` and `/customize` load on direct visits, and test on the exhibition Wi-Fi / mobile data.
4. Review current Vercel plan terms before business use.

## Content and honesty rules

- All metrics, charts, conversations, knowledge entries and settings are fictional and labelled as sample/demo data.
- The Max it scene is labelled as an **illustrative concept**. No Orange logos or screenshots are included; add approved assets only with permission.
- Scene controls (mute, end call, etc.) are visual only. The web-call scene never asks for microphone access.
- Before final polish, confirm which channels and capabilities (e.g. Setswana support, human handoff) are live versus planned, and adjust captions and labels on `/customize` or in the config.

## Assets still needed from the Leseding team

- Official logo (SVG or transparent PNG) — the current mark is a placeholder
- Approved brand colours
- Phone-call, web-call and Max it scene images (optional — coded mockups are used until then)
- Permission for any Orange / Max it branding
- Approved tagline, footer and contact details

## Accessibility and QA notes

- Semantic landmarks and headings; all tabs, the carousel and forms work by keyboard (arrow keys move between tabs).
- Carousel pauses on hover, on focus, when the tab is hidden, or with the pause button; respects `prefers-reduced-motion`.
- Status is never shown by colour alone (badges pair icon + text). Save/reset feedback uses live regions.
- Tested at 1440, 1280, 768, 390 and 320 px wide with no page-level horizontal overflow.

---

Leseding AI Engine · BlueApps Technology (Pty) Ltd
