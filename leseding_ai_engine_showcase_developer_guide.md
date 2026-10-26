# Leseding AI Engine — Interactive Showcase Website
## Developer Build Guide & Functional Specification

**Purpose:** Guide a developer building a premium, single-page interactive product showcase for Leseding AI Engine, plus a separate customization page for updating brand colours and showcase images without editing application code.

**Product:** Leseding AI Engine  
**Primary use:** Public demonstration website for exhibition visitors, prospective partners, and organisation decision-makers.  
**Deployment target:** Public Vercel URL.  
**Build principle:** A polished, guided product demonstration—not a generic marketing landing page.

---

## 1. Product goals

Build a responsive website that demonstrates two sides of Leseding AI Engine:

1. **Customer experience:** Show how a customer might interact with Leseding AI through a normal phone call, a web call, and an illustrative experience inside the Orange Max it app.
2. **Organisation experience:** Show an interactive, simulated organisation-side admin dashboard inside a desktop-monitor frame. Visitors should be able to switch tabs and explore example controls.

Also provide a **Customize** control that opens a separate page where an authorised presenter/developer can change theme colours and images.

### Success criteria
- A visitor understands the customer-facing and organisation-facing sides within 30–60 seconds.
- Customer visuals rotate automatically with seamless transitions and remain manually controllable.
- Dashboard tabs and sample controls are interactive, not merely static screenshots.
- Brand colours and showcase images can be changed from the customization page without editing source code.
- The website is responsive, accessible, fast, and stable on laptop, tablet, and phone.
- The demo distinguishes illustrative/simulated content from live product capabilities.

---

## 2. Scope and boundaries

### In scope
- One primary showcase page.
- One separate customization page.
- Three rotating customer-experience scenes.
- A monitor-framed, interactive simulated organisation dashboard.
- Local demo data, filters, tab navigation, sample controls, and reset-to-default.
- Configurable theme colours, text labels, and image assets.
- Public static deployment on Vercel.
- Documentation for replacing assets and deploying updates.

### Not required for this showcase
- Real authentication or production user accounts.
- Live customer conversations, telephony, AI inference, or knowledge-base APIs.
- Real analytics or customer data.
- Production organisation settings or channel connections.
- Actual uploads to a backend.
- A database, unless a later requirement explicitly calls for shared/persistent configuration.

**Important:** The dashboard is a front-end simulation. Do not imply that a control changes the live Leseding AI Engine unless a real integration exists and has been tested.

### Branding and integration honesty
- Use the official Leseding AI Engine logo and approved brand assets when supplied.
- Only use Orange/Max it branding or screenshots when the team has permission.
- Label the Max it view as a **concept/demo** unless the integration is real, authorised, and operational.
- Only claim Setswana support, human handoff, live analytics, or other capabilities if verified. Otherwise mark them as “planned”, “illustrative”, or omit them from claims.
- Use fictional or anonymised names and conversation content.

---

## 3. Recommended free-first technology stack

Use a modern React-based stack with a static/client-side implementation wherever possible.

| Area | Recommendation | Purpose |
|---|---|---|
| Framework | Next.js + TypeScript | Page routing, reusable components, maintainable code |
| Styling | Tailwind CSS + CSS variables | Responsive layout and configurable design tokens |
| Animation | Motion for React (`motion`) or CSS transitions | Smooth scene and interface transitions |
| Icons | Lucide React | Consistent lightweight icons |
| Charts | Recharts or lightweight CSS/SVG charts | Illustrative dashboard charts |
| Hosting | Vercel | Public demo URL and simple deployments |
| Image editing | Canva or Figma free tier | Prepare/resize assets and mockups |
| Version control | GitHub | Source control and deployment workflow |

Use current stable versions at implementation time. Confirm the current terms and limits of chosen free plans before public business use. Avoid adding a backend or paid service unless necessary.

### Persistence recommendation
For a simple public demo:
- Use a **default configuration file** for initial theme and image settings.
- Use `localStorage` to preserve customization on the same browser/device.
- Provide a **Reset to defaults** action.

This means customization is local to the browser that made it. It will not automatically change the configuration for every visitor. If the team needs one shared configuration across all devices, add a protected configuration service/database later; do not imply that `localStorage` is shared.

---

## 4. Site map and navigation

### Routes
- `/` — Main showcase page.
- `/customize` — Customization page.

### Persistent side control
Add a discreet but visible **Customize** button on the showcase page, preferably fixed near the lower-right edge or in the top-right navigation. It should:
- Have a clear label and a settings/sliders icon.
- Navigate to `/customize`.
- Remain accessible without covering important content.
- Have a visible focus state and accessible name.
- Be repositioned on smaller screens if needed to avoid covering content.

The customization page should include:
- Page title: **Customize Showcase**
- Short note: “Changes apply to this browser unless shared configuration is implemented.”
- Save/Apply Changes button.
- Reset to Defaults button.
- Back to Showcase link/button.
- Clear feedback when settings are saved or reset.

---

## 5. Main showcase page layout

### Desktop layout
Use a clean, balanced two-panel composition:
- Slim header containing the logo, a short product descriptor, and optional “Demo mode” label.
- Main content in two columns:
  - **Left: Customer Experience** — approximately 45% width.
  - **Right: Organisation Dashboard** — approximately 55% width.
- Restrained gap between panels.
- Maximum content width around 1500–1700px.
- Generous spacing, restrained shadows, aligned edges, and clear headings.

Avoid squeezing the whole experience into one viewport. The page may scroll vertically on smaller laptop screens.

### Mobile/tablet layout
- Stack the customer experience first and dashboard second.
- Scale down the monitor frame without making the dashboard unreadable.
- If the dashboard is too wide on a small screen, use a contained horizontal scroll area or a compact mobile dashboard presentation.
- Keep Customize reachable without covering controls.
- Ensure all dashboard tabs remain accessible.

### Suggested content hierarchy
**Header**
- Leseding AI Engine logo
- Descriptor: “Voice-first AI customer support”
- Optional “Interactive showcase” label

**Main heading**
- Example: “Customer support, starting with a voice.”
- Supporting copy should describe the product accurately and avoid unsupported performance claims.

**Panel headings**
- Left: Customer Experience
- Right: Organisation Dashboard

**Footer**
- “Interactive demonstration — sample data and simulated controls.”
- Optional project contact details once approved.

---

## 6. Left panel — Customer Experience scene carousel

Create a reusable component, such as `CustomerExperienceCarousel`, containing three scenes. Keep the device frame stable while the scene content changes.

### Scene A — Normal phone call
Show a realistic smartphone mockup displaying an active call with an AI support agent.

Suggested details:
- Contact label: “Leseding AI Support” or another approved demo name.
- Call timer that increments only while this scene is active, or a clearly illustrative static duration.
- Call status such as “Call connected — demo”.
- Subtle waveform/audio animation.
- End-call and mute icons as visual controls. If they do not perform a real action, make them non-interactive or clearly illustrative.

Do not imply the demo is connected to a real telephone number unless it is.

### Scene B — Leseding AI web call
Show a mobile web-call interface in a smartphone frame.

Suggested details:
- “Talk to Leseding AI”
- Microphone/call control
- Example listening/speaking states
- Small “Demo conversation” label
- Optional example prompt or transcript snippet

Do not request microphone permissions unless a working voice feature is deliberately implemented. A visual simulation should not trigger device permissions.

### Scene C — Orange Max it app concept
Show an approved mockup illustrating how Leseding AI could appear within the Orange Max it app.

Requirements:
- Use approved assets/screenshots, or a clearly labelled concept mockup.
- Do not imply a completed integration or Orange endorsement unless authorised and verified.
- Use a caption such as “Illustrative in-app concept” when applicable.

### Carousel behaviour
- Auto-advance every **5–7 seconds**.
- Use a **600–900 ms** crossfade with slight horizontal movement.
- Keep the outer device frame and panel dimensions stable to prevent layout jumping.
- Update scene title, description, and active indicator together.
- Provide three manual indicator buttons/tabs with accessible labels.
- Pause auto-rotation when the visitor hovers over the carousel or focuses an interactive element within it.
- Respect `prefers-reduced-motion`; disable or greatly reduce movement when requested.
- Preload the next image where practical.
- If an image is missing, show a designed placeholder with the scene name instead of a broken-image icon.
- Keep transitions subtle; avoid excessive parallax, spinning, or dramatic zoom effects.

### Scene captions
Use concise captions, for example:
1. **Phone call** — “Reach the support agent through a regular phone call.”
2. **Web call** — “A browser-based way to speak with the agent.”
3. **Max it concept** — “An illustrative in-app experience.”

Only use these captions if they accurately represent the intended product direction. Adjust wording if a channel is not yet implemented.

---

## 7. Right panel — Interactive organisation dashboard

Build a real front-end dashboard using React components and local mock data. Do not use one flat dashboard screenshot as the entire interactive experience.

### Monitor frame
- Use a CSS-built desktop monitor frame where possible.
- Keep monitor bezel, stand, and screen consistent across tabs.
- Use a 16:9 or 16:10 screen area.
- Ensure content remains legible at normal laptop viewing distance.
- Add a small “Demo data” label inside the interface.

### Sidebar or tab navigation
Create six primary sections:
1. Overview
2. AI Agent
3. Knowledge Base
4. Conversations
5. Analytics
6. Organisation Settings

Tabs must be selectable by click and keyboard. The selected tab should be visually obvious. Content can transition subtly without delaying interaction.

### Tab 1 — Overview
Purpose: communicate a high-level view of organisation support activity.

Example cards:
- Conversations
- AI-handled conversations
- Escalated to human
- Average response time

Include:
- Illustrative activity chart.
- Recent activity list.
- Channel summary if relevant.

All metrics must be marked as sample/illustrative data. Do not present invented numbers as actual pilot results.

### Tab 2 — AI Agent
Show example settings:
- Agent display name
- Agent status (Demo active / Paused)
- Welcome message
- Response style/tone
- Supported languages (only verified options, or clearly labelled demo choices)
- Operating hours
- Human handoff behaviour (simulated if not implemented)

Interaction:
- Inputs, dropdowns, toggles, or checkboxes respond.
- A local “Save changes” action updates demo state and shows confirmation.
- State changes must not be described as affecting a production agent.

### Tab 3 — Knowledge Base
Show a sample list of knowledge documents/entries.

Example fields:
- Document/entry name
- Category
- Status
- Last updated
- Search/filter control

Interaction:
- Search filters visible sample entries.
- Category/status filter works if included.
- “Add document” or “Upload document” opens a simulated modal or file-selection illustration only. Do not claim a real document was uploaded or indexed.
- An example knowledge entry can open in a detail panel.

### Tab 4 — Conversations
Show fictional conversations with:
- Reference ID
- Channel
- Time/date
- Topic
- Status
- Resolution or escalation label

Interaction:
- Search by reference/topic.
- Filter by channel or status.
- Selecting a conversation opens a detail panel with an illustrative transcript.
- Clearly identify transcripts as demo content.
- Do not include real personal information.

### Tab 5 — Analytics
Show charts or compact summaries for:
- Conversation volume over time
- Common enquiry categories
- AI-handled vs escalated conversations
- Response/resolution trends, if appropriate

Interaction:
- A date-range selector changes the mock dataset or chart view.
- Chart labels, legends, and values remain legible.
- All numbers are illustrative, not live telemetry.

### Tab 6 — Organisation Settings
Show demo fields for:
- Organisation name
- Brand/logo preview
- Default support greeting
- Channel availability
- Team/role examples
- Handoff/contact settings

Interaction:
- Inputs accept edits.
- Save/cancel actions work locally.
- A clear “Demo settings only” note is visible.
- Do not show real credentials, API keys, phone numbers, or private configuration.

### Dashboard interaction requirements
- Switching tabs updates the active tab and displayed content.
- Search and filters return relevant local sample data.
- Save controls visibly update local UI state and show feedback.
- Cancel/reset actions restore prior/default values as expected.
- “Reset demo” restores all dashboard data and settings to defaults.
- Empty states are designed intentionally.
- Do not add fake latency or pretend to call a backend.

---

## 8. Customization page — required features

The `/customize` page is a key requirement. It should let the team adapt the visual identity and images without editing React components or CSS.

### 8.1 Theme colour controls
Provide a labelled colour picker and hex input for each token. Update a live preview immediately.

Suggested tokens:
- **Primary:** key brand accents and active states.
- **Primary contrast:** text/icon colour on primary backgrounds.
- **Secondary:** supporting accent.
- **Page background:** main page background.
- **Panel/surface:** cards, panels, monitor interior.
- **Text:** primary body text.
- **Muted text:** secondary labels.
- **Border:** subtle dividers and outlines.
- **Success:** success states.
- **Warning:** warning states.

Use sensible initial defaults, centralised so the team can replace them later. Do not scatter raw hex codes throughout components.

Validation:
- Accept valid 3- or 6-digit hex colours and normalise to 6-digit values on save.
- Reject invalid values and show a useful inline message.
- Ensure contrast is adequate for text and controls. Where possible, show a contrast warning rather than silently accepting an unreadable combination.
- Preview hover, active, selected, and disabled states where useful.

### 8.2 Image controls
Allow replacement of the images used in three customer scenes and key branding assets.

Minimum image slots:
1. Logo
2. Phone-call scene image/mockup
3. Web-call scene image/mockup
4. Orange Max it concept image/mockup
5. Optional default organisation dashboard/brand preview image

For each slot:
- Show current thumbnail and asset name.
- Provide an **Upload image** control.
- Accept PNG, JPG/JPEG, and WebP.
- Validate file type and reasonable file size; recommended maximum **5 MB per image**.
- Show image preview before applying.
- Provide Replace and Restore default actions.
- Preserve aspect ratio; use appropriate `object-fit` per slot.
- Provide optional alternative text for accessibility.
- If an image cannot be loaded, show a fallback placeholder.

**Persistence:** Store uploaded image data locally in the browser only if file sizes and storage constraints are handled safely. A better lightweight alternative is to allow image upload for immediate preview and then export/download the selected image assets/configuration for the developer to place in `/public`. Explain the chosen approach clearly in the UI. Do not rely on `localStorage` for large base64 images without testing storage quotas.

### 8.3 Image URL / asset path option
Optionally provide an advanced field for an image URL or local public asset path, such as `/showcase/phone-call.webp`. Validate the format and show a preview. For public deployments, the image must be hosted at a reachable URL or included in deployed assets.

### 8.4 Text and label controls
Optionally allow editing:
- Product tagline
- Main page heading
- Customer panel heading
- Dashboard panel heading
- Captions for each scene
- Footer demo disclaimer

These values should update the preview immediately and be persisted with the theme.

### 8.5 Save, export, and reset
Provide:
- **Apply / Save changes:** saves configuration for this browser and applies it to the showcase.
- **Export configuration:** downloads a JSON file with theme colours, text labels, and asset paths/URLs. Do not embed large image binaries in JSON by default.
- **Import configuration:** optional but useful; validate all fields and reject malformed JSON.
- **Reset to defaults:** restores the shipped configuration after confirmation.
- **Back to Showcase:** navigates to `/`.

Include a note near Save:
> “Saved changes apply to this browser. To publish them for all visitors, update the default configuration/assets and redeploy, unless a shared configuration service has been added.”

### Recommended configuration structure
Keep the default configuration in one file, for example `config/showcase-config.ts`.

```ts
export type ShowcaseConfig = {
  theme: {
    primary: string;
    primaryContrast: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    border: string;
    success: string;
    warning: string;
  };
  branding: {
    logo: string;
    tagline: string;
    mainHeading: string;
    customerHeading: string;
    dashboardHeading: string;
    footerNote: string;
  };
  scenes: Array<{
    id: "phone-call" | "web-call" | "max-it-concept";
    title: string;
    caption: string;
    image: string;
    alt: string;
  }>;
  dashboard: {
    organisationName: string;
    demoLabel: string;
  };
};
```

Use CSS custom properties such as `--brand-primary`, `--brand-secondary`, `--page-background`, `--surface`, `--text-primary`, and `--border`. Apply them from the active configuration. Components should not contain hard-coded brand hex values.

### Important architecture decision
Create one configuration/state layer shared by both routes:
- `ShowcaseProvider` or equivalent React context.
- Default configuration imported from one central file.
- Validation and import/export helpers in a separate module.
- One function to apply theme variables.
- Safe local persistence with a schema/version field so future config changes can be migrated.

Suggested persistence key: `leseding-showcase-config-v1`.

If uploaded images are not persisted locally, state this clearly and provide a developer handoff/export process.

---

## 9. Visual direction

Aim for premium, restrained, technology-focused design.

### Design characteristics
- Clean typography with a strong hierarchy.
- Ample whitespace and consistent spacing.
- Subtle elevation, borders, and shadows.
- Consistent corner radii.
- High-quality device and monitor mockups.
- Smooth transitions and microinteractions.
- Strong readability and accessible contrast.
- Minimal decorative gradients; use them only if they support the brand.
- Avoid clutter, excessive glow effects, noisy backgrounds, and tiny dashboard text.

### Suggested initial layout values
These are starting points, not hard rules:
- Header height: approximately 64–80px.
- Panel gap: 24–32px.
- Panel radius: 16–24px.
- Desktop content max width: 1500–1700px.
- Main split: approximately 45/55.
- Scene transition: 600–900ms.
- Carousel dwell time: 5–7 seconds.

### Typography
Use a high-quality system font or a freely available font with suitable licensing. Keep headings short and avoid overly thin weights that reduce legibility.

---

## 10. Accessibility, responsiveness, and performance

### Accessibility
- Use semantic headings and landmarks.
- Ensure keyboard access for tabs, carousel indicators, and forms.
- Provide visible focus states.
- Give images meaningful alt text, or empty alt text if purely decorative.
- Associate each input with a visible label.
- Do not rely on colour alone to communicate status.
- Respect reduced-motion preferences.
- Announce save/reset feedback accessibly, e.g. with an appropriate live region.
- Maintain readable contrast.

### Responsiveness
Test at minimum:
- Wide desktop: 1440px and above.
- Standard laptop: 1280px.
- Tablet: around 768px.
- Mobile: around 390px and 320px.

Check that:
- No content overlaps.
- The monitor frame stays within the viewport.
- Tabs remain usable on mobile.
- Customize does not cover content.
- Form controls remain touch-friendly.
- Images are not stretched.

### Performance
- Optimise images for web and use WebP where suitable.
- Lazy-load below-the-fold assets.
- Preload the first visible scene and, where practical, the next scene.
- Avoid unnecessary animation libraries or large dependencies.
- Avoid layout shifts when scenes change.
- Use sensible fallbacks for missing assets.
- Keep demo functionality client-side unless there is a justified reason to add a backend.

---

## 11. Suggested project structure

```text
leseding-showcase/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── customize/
│   │   └── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── ShowcaseLayout.tsx
│   ├── CustomerExperienceCarousel.tsx
│   ├── DeviceFrame.tsx
│   ├── AdminMonitor.tsx
│   ├── DashboardSidebar.tsx
│   ├── DashboardTabs.tsx
│   ├── DemoControls.tsx
│   ├── CustomizeButton.tsx
│   ├── ThemeEditor.tsx
│   ├── ImageAssetEditor.tsx
│   └── LivePreview.tsx
├── dashboard/
│   ├── OverviewTab.tsx
│   ├── AgentTab.tsx
│   ├── KnowledgeBaseTab.tsx
│   ├── ConversationsTab.tsx
│   ├── AnalyticsTab.tsx
│   └── SettingsTab.tsx
├── config/
│   ├── showcase-config.ts
│   └── demo-data.ts
├── lib/
│   ├── config-storage.ts
│   ├── config-validation.ts
│   ├── theme.ts
│   └── export-import.ts
├── public/
│   ├── logo/
│   ├── team/
│   └── showcase/
├── README.md
├── package.json
└── ...
```

The exact folder structure may vary, but keep dashboard tabs, default configuration, persistence, and theme logic separate and maintainable.

---

## 12. Demo data and content rules

Use fictional sample data only. Example categories:
- Account information
- Product/service information
- Billing
- Technical support
- General enquiries

Example conversation:
- Customer: “How can I check my account balance?”
- AI Agent: “I can guide you through the available options. This is a sample conversation for demonstration.”

Do not use real customer records, production transcripts, credentials, private phone numbers, or confidential organisation information.

All dashboard metrics, charts, conversation records, knowledge documents, and organisation settings must be identified as sample data or demo-only content.

---

## 13. Deployment and operational notes

### Vercel
- Connect the GitHub repository to Vercel.
- Deploy the Next.js application.
- Confirm `/` and `/customize` work on direct page load.
- Verify the public URL can be opened on intended exhibition Wi-Fi/mobile networks.
- Test a production build, not just the local development server.
- Confirm no secrets or private files are included in the public bundle.
- Review current Vercel plan terms and limits before business use.

### Configuration publishing workflow
Because browser-local configuration does not change what other visitors see:
1. Presenter uses `/customize` to preview colours and images.
2. Export configuration or record selected values and asset paths.
3. Put approved image files in `public/showcase/`.
4. Update the central default configuration.
5. Commit and deploy the update.
6. Verify the public URL in a clean browser session.

If the team wants non-developers to update the live public version from any device without redeploying, treat that as a separate phase requiring an authenticated shared configuration store or CMS. It is not included in the lightweight free-first baseline.

---

## 14. Testing and acceptance checklist

### Showcase
- [ ] Main page loads at `/`.
- [ ] Header and both panels render correctly.
- [ ] Three customer scenes display the correct image, title, caption, and alt text.
- [ ] Carousel advances automatically within the specified interval.
- [ ] Manual indicators select the intended scene.
- [ ] Hover/focus pauses automatic rotation.
- [ ] Reduced-motion preference is respected.
- [ ] Missing images show graceful placeholders.
- [ ] No unintended claim implies that a simulated integration is live.

### Dashboard
- [ ] All six tabs are selectable by mouse and keyboard.
- [ ] The active tab is clearly indicated.
- [ ] Search and filters work with local demo data.
- [ ] Selecting a conversation opens the correct detail view.
- [ ] Demo controls visibly update the interface.
- [ ] Save/cancel/reset actions behave consistently.
- [ ] Analytics range changes the illustrative view.
- [ ] Reset demo restores default state.
- [ ] All metrics and records are labelled as illustrative/demo content.

### Customization
- [ ] Customize button navigates to `/customize`.
- [ ] All colour tokens can be edited through a picker and hex input.
- [ ] Invalid hex values are rejected with a helpful message.
- [ ] Live preview updates as colours change.
- [ ] Each required image slot can be replaced.
- [ ] File type and file size validation work.
- [ ] Preview, replace, and restore-default actions work.
- [ ] Optional labels/captions can be edited if implemented.
- [ ] Save persists selected settings in the documented way.
- [ ] Refreshing the same browser preserves saved settings.
- [ ] Reset restores defaults.
- [ ] Exported configuration is valid JSON and can be used in the documented workflow.
- [ ] UI clearly explains browser-local changes versus globally published changes.

### Quality and deployment
- [ ] Layout is checked at desktop, tablet, and mobile widths.
- [ ] No horizontal overflow except in deliberately contained areas.
- [ ] Keyboard focus is visible.
- [ ] Text contrast is acceptable.
- [ ] No broken links or console errors.
- [ ] No private data or secrets are shipped.
- [ ] Production deployment works on a public Vercel URL.
- [ ] Developer README explains local setup, asset replacement, customization persistence, and deployment.

---

## 15. Recommended delivery phases

### Phase 1 — Foundation
- Create the Next.js + TypeScript project.
- Add global design tokens and responsive layout.
- Create the two routes and shared configuration layer.
- Add initial placeholder assets.

### Phase 2 — Customer experience
- Build the device frame and three scenes.
- Implement auto-rotation, indicators, pause behaviour, and reduced-motion support.
- Confirm stable layout and image fallbacks.

### Phase 3 — Dashboard simulation
- Build the monitor frame and navigation.
- Implement the six dashboard tabs.
- Add sample data, filters, settings, and reset behaviour.

### Phase 4 — Customization page
- Implement colour tokens and live preview.
- Implement image upload/preview/replace/restore.
- Add local persistence, reset, and configuration export.
- Add clear messaging about browser-local changes versus public deployment.

### Phase 5 — Premium polish and QA
- Refine typography, spacing, shadows, transitions, and responsive behaviour.
- Run accessibility and performance checks.
- Test on the actual laptop/screen intended for demonstrations.
- Verify the public Vercel deployment and document handover steps.

**Indicative effort:** Around 3–5 working days for an experienced front-end developer using prepared assets and a static/local-demo approach. Allow more time if original mockups must be created, asset approvals are pending, or shared online customization is required.

---

## 16. Required inputs from the Leseding team

The developer can begin with placeholders, but request these assets before final polish:
- Official logo in SVG or transparent PNG.
- Approved brand colours, if already defined.
- Phone-call scene mockup/image.
- Web-call scene mockup/image.
- Approved Max it concept/mockup and permission to use relevant branding.
- Current organisation dashboard screenshots or a short list of intended controls.
- Confirmed list of available versus planned features.
- Approved product tagline and footer/contact details.
- Any required disclaimers.

The customization page should make it possible to replace colours and images later without changing component code.

---

## 17. Final implementation principle

Build a **self-contained interactive showroom** with a clear separation between:
1. the public showcase UI,
2. the simulated dashboard state,
3. configurable branding/assets, and
4. any future live product integrations.

Prioritise reliability and clarity during live demonstrations. A smaller set of controls that work consistently is better than a larger dashboard filled with non-functional elements. Make the page visually premium, but keep every claim honest and every important interaction dependable.
