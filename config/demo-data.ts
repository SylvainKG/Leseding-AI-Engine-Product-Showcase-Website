/**
 * Fictional sample data for the simulated organisation dashboard.
 * Nothing here is real customer data, pilot results or live telemetry.
 *
 * The numbers are hand-tuned to read like a mid-sized Botswana support line:
 * morning and lunchtime peaks, quieter weekends, a month-end bump, and a mix
 * of English, Setswana and code-switched calls. Overview, Conversations and
 * Analytics all draw on the same figures so they agree with each other.
 */

export type Channel = "Phone call" | "Web call" | "In-app (concept)";
export type Language = "English" | "Setswana" | "Mixed";
export type Outcome = "Resolved by Lesedi" | "Transferred" | "Abandoned" | "In progress";

export type Category =
  | "Account information"
  | "Product/service information"
  | "Billing"
  | "Technical support"
  | "General enquiries";

export const categories: Category[] = [
  "Account information",
  "Product/service information",
  "Billing",
  "Technical support",
  "General enquiries",
];

export const channels: Channel[] = ["Phone call", "Web call", "In-app (concept)"];

/* ---------------- Small deterministic helpers ---------------- */

/** Seeded PRNG so server and client render identical "random" data. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- Today (Overview) ---------------- */

/** Support line hours shown on the hourly chart. */
export const hours = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];

/** Calls per hour today (the 14:00 hour is still in progress) and on the same weekday last week. */
export const callsByHour = {
  today: [18, 48, 74, 66, 55, 52, 68, 37],
  lastWeek: [15, 44, 70, 69, 51, 47, 61, 58, 43, 39, 35, 41, 30, 17],
};

export const today = {
  calls: 418,
  resolved: 241,
  transferred: 156,
  abandoned: 21,
  avgHandle: "2:41",
  avgWaitForAgent: "0:47",
  /** Same point in the day, last week. */
  prev: { calls: 391, resolvedPct: 55.2, transferredPct: 38.9, avgHandle: "2:56", abandonedPct: 5.9 },
};

export const languageMix: Array<{ language: Language; share: number }> = [
  { language: "English", share: 47 },
  { language: "Setswana", share: 31 },
  { language: "Mixed", share: 22 },
];

export type Intent = { name: string; calls: number; resolved: number; avgTime: string; note?: string };

export const topIntents: Intent[] = [
  { name: "Airtime & data balance", calls: 96, resolved: 87, avgTime: "1:12" },
  { name: "Data bundle not working", calls: 71, resolved: 41, avgTime: "3:05" },
  { name: "Top-up not reflecting", calls: 54, resolved: 21, avgTime: "3:48" },
  { name: "Mobile money PIN reset", calls: 43, resolved: 5, avgTime: "4:20", note: "ID check needs an agent" },
  { name: "Network outage in my area", calls: 38, resolved: 33, avgTime: "1:34" },
  { name: "Disputed charge on bill", calls: 29, resolved: 2, avgTime: "5:02", note: "Policy: always transfer" },
  { name: "Store hours & locations", calls: 27, resolved: 26, avgTime: "0:58" },
  { name: "Other", calls: 60, resolved: 26, avgTime: "2:51" },
];

export type LiveCall = {
  caller: string;
  channel: Channel;
  language: Language;
  intent: string;
  /** Typical length of this kind of call, in seconds. */
  length: number;
  /** Whether Lesedi hands this call to a person part-way through. */
  transfers?: boolean;
};

/**
 * Pool of in-progress calls. The overview shows four "lines"; when a call on a
 * line finishes, the next one from the pool starts, so the panel stays
 * believable however long the screen is left running.
 */
export const liveCallPool: LiveCall[] = [
  { caller: "+267 72 ••• 418", channel: "Phone call", language: "Setswana", intent: "Data bundle not working", length: 186 },
  { caller: "+267 74 ••• 093", channel: "Phone call", language: "Mixed", intent: "Top-up not reflecting", length: 228, transfers: true },
  { caller: "Web visitor", channel: "Web call", language: "English", intent: "Store hours & locations", length: 58 },
  { caller: "+267 71 ••• 562", channel: "Phone call", language: "English", intent: "Disputed charge on bill", length: 262, transfers: true },
  { caller: "+267 76 ••• 251", channel: "Phone call", language: "Setswana", intent: "Airtime & data balance", length: 71 },
  { caller: "+267 73 ••• 907", channel: "Phone call", language: "Mixed", intent: "Network outage in my area", length: 94 },
  { caller: "+267 75 ••• 840", channel: "Phone call", language: "Setswana", intent: "Mobile money PIN reset", length: 205, transfers: true },
  { caller: "Web visitor", channel: "Web call", language: "English", intent: "Airtime & data balance", length: 66 },
  { caller: "+267 77 ••• 305", channel: "Phone call", language: "English", intent: "Data bundle not working", length: 154 },
  { caller: "+267 72 ••• 664", channel: "Phone call", language: "Setswana", intent: "Store hours & locations", length: 49 },
];

/** Four lines, each starting part-way through a call. */
export const liveLines = [
  { first: 0, offset: 74 },
  { first: 1, offset: 151 },
  { first: 2, offset: 22 },
  { first: 3, offset: 203 },
];

/** Number of calls in progress, used for the sidebar count. */
export const liveCallCount = liveLines.length;

export const recentTransfers = [
  { ref: "LSD-48217", time: "14:29", intent: "Disputed charge on bill", reason: "Policy: billing disputes go to an agent", to: "Billing desk" },
  { ref: "LSD-48211", time: "14:24", intent: "Mobile money PIN reset", reason: "Identity check needs an agent", to: "Mobile money team" },
  { ref: "LSD-48206", time: "14:19", intent: "Top-up not reflecting", reason: "Caller asked for a person", to: "General support" },
  { ref: "LSD-48198", time: "14:12", intent: "Other", reason: "Not understood after two tries", to: "General support" },
];

/* ---------------- Knowledge base ---------------- */

export type KbStatus = "Published" | "Draft" | "Needs review";

export type KbEntry = {
  id: string;
  name: string;
  category: Category;
  status: KbStatus;
  updated: string;
  editor: string;
  /** Times the agent used this entry in the last 7 days. */
  uses: number;
  summary: string;
  simulated?: boolean;
};

export const kbEntries: KbEntry[] = [
  {
    id: "kb-1",
    name: "Checking airtime and data balance",
    category: "Account information",
    status: "Published",
    updated: "12 Oct",
    editor: "Boitumelo S.",
    uses: 612,
    summary: "USSD codes, the app and SMS options for checking airtime and bundle balances, with expiry rules.",
  },
  {
    id: "kb-2",
    name: "Prepaid top-up guide",
    category: "Billing",
    status: "Published",
    updated: "20 Oct",
    editor: "Boitumelo S.",
    uses: 341,
    summary: "Top-up channels, how long each takes to reflect, and when to raise a ticket instead of asking the caller to wait.",
  },
  {
    id: "kb-3",
    name: "Outage wording — planned and unplanned",
    category: "Technical support",
    status: "Needs review",
    updated: "22 Oct",
    editor: "Tumo R.",
    uses: 227,
    summary: "Approved wording for outages by area. Tumo flagged the Tlokweng maintenance window as out of date.",
  },
  {
    id: "kb-4",
    name: "Data bundle troubleshooting",
    category: "Technical support",
    status: "Published",
    updated: "18 Oct",
    editor: "Tumo R.",
    uses: 448,
    summary: "APN settings, mobile data toggle, bundle activation checks, and when to restart the device.",
  },
  {
    id: "kb-5",
    name: "Plans and bundles catalogue",
    category: "Product/service information",
    status: "Draft",
    updated: "24 Oct",
    editor: "Kagiso M.",
    uses: 0,
    summary: "Short descriptions of each plan and who it suits. Waiting on November prices before publishing.",
  },
  {
    id: "kb-6",
    name: "Store hours and locations",
    category: "General enquiries",
    status: "Published",
    updated: "05 Oct",
    editor: "Naledi P.",
    uses: 173,
    summary: "Opening hours for each store, public holiday hours, and the nearest store by area.",
  },
  {
    id: "kb-7",
    name: "Disputed charges — what to collect",
    category: "Billing",
    status: "Draft",
    updated: "25 Oct",
    editor: "Kagiso M.",
    uses: 0,
    summary: "Details Lesedi should collect before transferring a billing dispute, so the agent doesn't have to ask again.",
  },
];

/* ---------------- Conversations ---------------- */

export type ConvStatus = "Resolved" | "Transferred" | "Abandoned";

export type Turn = { at: string; who: "Caller" | "Lesedi" | "Agent"; text: string; note?: string };

export type Conversation = {
  ref: string;
  channel: Channel;
  when: string;
  caller: string;
  duration: string;
  intent: string;
  category: Category;
  status: ConvStatus;
  language: Language;
  transferTo?: string;
  reason?: string;
  transcript: Turn[];
};

export const conversations: Conversation[] = [
  {
    ref: "LSD-48221",
    channel: "Phone call",
    when: "Today 14:31",
    caller: "+267 77 ••• 305",
    duration: "1:04",
    intent: "Airtime & data balance",
    category: "Account information",
    status: "Resolved",
    language: "Setswana",
    transcript: [
      { at: "0:02", who: "Lesedi", text: "Dumela, o bua le Lesedi. Nka go thusa ka eng gompieno?" },
      { at: "0:07", who: "Caller", text: "Dumela. Ke kopa go itse gore ke na le data e kana kang." },
      { at: "0:12", who: "Lesedi", text: "Ke a go leboga. Ke tla tlhola akhaonto ya gago ka nomoro e o letsang ka yone.", note: "Account matched by caller number" },
      { at: "0:19", who: "Lesedi", text: "O na le 1.2 GB e e setseng. E fela ka Labotlhano." },
      { at: "0:25", who: "Caller", text: "Go siame, ke a leboga." },
    ],
  },
  {
    ref: "LSD-48217",
    channel: "Phone call",
    when: "Today 14:29",
    caller: "+267 71 ••• 562",
    duration: "3:47",
    intent: "Disputed charge on bill",
    category: "Billing",
    status: "Transferred",
    language: "Mixed",
    transferTo: "Billing desk",
    reason: "Policy: billing disputes go to an agent",
    transcript: [
      { at: "0:03", who: "Caller", text: "Dumela rra. There's a P120 charge on my bill and I don't know what it is." },
      { at: "0:10", who: "Lesedi", text: "Dumela. I can see a P120 charge on 14 October for an international roaming bundle. Does that sound familiar?" },
      { at: "0:21", who: "Caller", text: "Nnyaa, ga ke a tsamaya. I wasn't travelling." },
      { at: "0:26", who: "Lesedi", text: "Thank you. Disputes are handled by our billing desk, so I'm passing you over with a summary. You won't need to repeat yourself.", note: "Transfer · Billing desk · summary attached" },
      { at: "1:13", who: "Agent", text: "Hi, this is Thato from billing. I have the details here — let me look at that roaming charge for you." },
    ],
  },
  {
    ref: "LSD-48214",
    channel: "Web call",
    when: "Today 14:26",
    caller: "Web visitor",
    duration: "0:52",
    intent: "Store hours & locations",
    category: "General enquiries",
    status: "Resolved",
    language: "English",
    transcript: [
      { at: "0:02", who: "Lesedi", text: "Hi, you're speaking with Lesedi. How can I help?" },
      { at: "0:05", who: "Caller", text: "What time does the Game City store close on Saturday?" },
      { at: "0:09", who: "Lesedi", text: "Game City closes at 17:00 on Saturdays and 13:00 on Sundays. Would you like directions?" },
      { at: "0:16", who: "Caller", text: "No, that's all. Thanks." },
    ],
  },
  {
    ref: "LSD-48211",
    channel: "Phone call",
    when: "Today 14:24",
    caller: "+267 75 ••• 840",
    duration: "2:18",
    intent: "Mobile money PIN reset",
    category: "Account information",
    status: "Transferred",
    language: "Setswana",
    transferTo: "Mobile money team",
    reason: "Identity check needs an agent",
    transcript: [
      { at: "0:04", who: "Caller", text: "Ke lebetse PIN ya me ya mobile money." },
      { at: "0:09", who: "Lesedi", text: "Ke a utlwa. Go fetola PIN go tlhoka gore re netefatse gore ke wena, ka jalo ke go fetisetsa kwa go motho." , note: "Transfer · Mobile money team" },
      { at: "0:58", who: "Agent", text: "Dumela mma, ke Kabelo. A re simolole ka nomoro ya Omang ya gago." },
    ],
  },
  {
    ref: "LSD-48209",
    channel: "Phone call",
    when: "Today 14:22",
    caller: "+267 72 ••• 117",
    duration: "2:36",
    intent: "Data bundle not working",
    category: "Technical support",
    status: "Resolved",
    language: "English",
    transcript: [
      { at: "0:03", who: "Caller", text: "I bought a 2 GB bundle this morning but my data isn't working." },
      { at: "0:09", who: "Lesedi", text: "Your bundle is active with 1.9 GB left, so it's probably a phone setting. Is mobile data switched on?" },
      { at: "0:20", who: "Caller", text: "Let me check… it was off. It's working now." },
      { at: "0:27", who: "Lesedi", text: "Great. If it stops again, restarting the phone usually helps. Anything else?" },
    ],
  },
  {
    ref: "LSD-48206",
    channel: "In-app (concept)",
    when: "Today 14:19",
    caller: "+267 74 ••• 093",
    duration: "4:05",
    intent: "Top-up not reflecting",
    category: "Billing",
    status: "Transferred",
    language: "Mixed",
    transferTo: "General support",
    reason: "Caller asked for a person",
    transcript: [
      { at: "0:03", who: "Caller", text: "Ke rekile airtime ya P50 mme ga e ise e tsene." },
      { at: "0:09", who: "Lesedi", text: "I can see a P50 top-up from 13:52 that is still processing. These usually reflect within 30 minutes." },
      { at: "0:18", who: "Caller", text: "It's been more than that. Can I talk to someone please?" },
      { at: "0:22", who: "Lesedi", text: "Of course. I'm connecting you now and sharing the top-up reference.", note: "Transfer · General support" },
    ],
  },
  {
    ref: "LSD-48203",
    channel: "Phone call",
    when: "Today 14:15",
    caller: "+267 76 ••• 251",
    duration: "1:21",
    intent: "Network outage in my area",
    category: "Technical support",
    status: "Resolved",
    language: "Setswana",
    transcript: [
      { at: "0:03", who: "Caller", text: "A go na le bothata jwa network kwa Tlokweng gompieno?" },
      { at: "0:08", who: "Lesedi", text: "Ee, go na le tiro e e rulaganeng kwa Tlokweng go fitlha ka 15:00." },
      { at: "0:15", who: "Lesedi", text: "A o batla gore ke go romelele molaetsa fa e fedile?" },
      { at: "0:19", who: "Caller", text: "Ee, ke a leboga." },
    ],
  },
  {
    ref: "LSD-48198",
    channel: "Phone call",
    when: "Today 14:12",
    caller: "+267 73 ••• 664",
    duration: "1:49",
    intent: "Other",
    category: "General enquiries",
    status: "Transferred",
    language: "Mixed",
    transferTo: "General support",
    reason: "Not understood after two tries",
    transcript: [
      { at: "0:04", who: "Caller", text: "Ke batla go fetola… the thing on my contract, the name on it." },
      { at: "0:11", who: "Lesedi", text: "Just to check — do you want to change the name on your contract?" },
      { at: "0:16", who: "Caller", text: "No, the… ke batla go tlosa nomoro e nngwe." },
      { at: "0:23", who: "Lesedi", text: "Sorry, I didn't quite get that. I'll pass you to a colleague who can help.", note: "Transfer · low confidence twice" },
    ],
  },
  {
    ref: "LSD-48190",
    channel: "Phone call",
    when: "Today 14:06",
    caller: "+267 77 ••• 932",
    duration: "0:19",
    intent: "Other",
    category: "General enquiries",
    status: "Abandoned",
    language: "English",
    transcript: [
      { at: "0:02", who: "Lesedi", text: "Hi, you're speaking with Lesedi. How can I help?" },
      { at: "0:19", who: "Caller", text: "", note: "Caller hung up" },
    ],
  },
];

conversations.push(
  {
    ref: "LSD-48186",
    channel: "Web call",
    when: "Today 14:02",
    caller: "Web visitor",
    duration: "1:38",
    intent: "Data bundle not working",
    category: "Technical support",
    status: "Resolved",
    language: "Mixed",
    transcript: [
      { at: "0:03", who: "Caller", text: "Data ya me ga e bereke since this morning." },
      { at: "0:10", who: "Lesedi", text: "I can see your 5 GB bundle is active. Please switch flight mode on and off, then try again." },
      { at: "0:31", who: "Caller", text: "Ee, e a bereka jaanong. Thanks." },
    ],
  },
  {
    ref: "LSD-48181",
    channel: "Phone call",
    when: "Today 13:58",
    caller: "+267 74 ••• 726",
    duration: "0:47",
    intent: "Airtime & data balance",
    category: "Account information",
    status: "Resolved",
    language: "English",
    transcript: [
      { at: "0:02", who: "Lesedi", text: "Hi, you're speaking with Lesedi. How can I help?" },
      { at: "0:05", who: "Caller", text: "How much airtime do I have left?" },
      { at: "0:09", who: "Lesedi", text: "You have P23.40 airtime. It doesn't expire. Anything else?" },
      { at: "0:14", who: "Caller", text: "No, that's it." },
    ],
  },
  {
    ref: "LSD-48177",
    channel: "Phone call",
    when: "Today 13:52",
    caller: "+267 71 ••• 389",
    duration: "3:12",
    intent: "Mobile money PIN reset",
    category: "Account information",
    status: "Transferred",
    language: "English",
    transferTo: "Mobile money team",
    reason: "Identity check needs an agent",
    transcript: [
      { at: "0:04", who: "Caller", text: "My mobile money account is locked. I entered the wrong PIN three times." },
      { at: "0:11", who: "Lesedi", text: "Unlocking an account needs an identity check, so I'm passing you to the mobile money team with a note.", note: "Transfer · Mobile money team" },
      { at: "1:02", who: "Agent", text: "Hello, this is Neo. I'll help you unlock it — can you confirm your full name?" },
    ],
  },
);

/* ---------------- Analytics ---------------- */

export type RangeKey = "7d" | "30d" | "90d";

export const ranges: Array<{ key: RangeKey; label: string }> = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

type DayPoint = { label: string; resolved: number; transferred: number; abandoned: number; total: number };

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Relative volume by weekday: busy Monday, quiet Sunday. */
const weekdayWeight = [1.12, 1.0, 0.97, 1.0, 1.05, 0.62, 0.41];

function dailySeries(days: number, endWeekday: number, endDate: number, seed: number, base: number): DayPoint[] {
  const r = rng(seed);
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const wd = (((endWeekday - i) % 7) + 7) % 7;
    const date = ((endDate - i - 1 + 31 * 4) % 31) + 1;
    // Month-end salary days are busier.
    const payday = date >= 24 && date <= 27 ? 1.22 : 1;
    // Containment improves slowly over the period as the knowledge base grows.
    const learn = 0.5 + 0.08 * ((days - i) / days);
    const total = Math.round(base * weekdayWeight[wd] * payday * (0.92 + r() * 0.16));
    const resolved = Math.round(total * (learn + (r() - 0.5) * 0.04));
    const abandoned = Math.round(total * (0.04 + r() * 0.025));
    out.push({ label: days <= 7 ? weekdays[wd] : `${date}`, resolved, abandoned, transferred: total - resolved - abandoned, total });
  }
  return out;
}

function weekly(points: DayPoint[]): DayPoint[] {
  const out: DayPoint[] = [];
  for (let i = 0; i < points.length; i += 7) {
    const w = points.slice(i, i + 7);
    const sum = (k: keyof Omit<DayPoint, "label">) => w.reduce((a, p) => a + p[k], 0);
    out.push({ label: `W${out.length + 1}`, resolved: sum("resolved"), transferred: sum("transferred"), abandoned: sum("abandoned"), total: sum("total") });
  }
  return out;
}

// The series end on a Thursday the 29th, matching "today" on the overview.
const d7 = dailySeries(7, 3, 29, 11, 610);
const d30 = dailySeries(30, 3, 29, 23, 610);
const d90 = weekly(dailySeries(91, 3, 29, 37, 590));

/** Calls by weekday (rows, Mon–Sun) and hour (columns, matching `hours`). */
export const heatmap: number[][] = (() => {
  const shape = [0.25, 0.72, 1, 0.93, 0.77, 0.74, 0.92, 0.8, 0.6, 0.55, 0.5, 0.58, 0.44, 0.24];
  const r = rng(91);
  return weekdayWeight.map((w) => shape.map((s) => Math.round(70 * w * s * (0.88 + r() * 0.24))));
})();

function summarise(points: DayPoint[]) {
  const t = points.reduce(
    (a, p) => ({ resolved: a.resolved + p.resolved, transferred: a.transferred + p.transferred, abandoned: a.abandoned + p.abandoned, total: a.total + p.total }),
    { resolved: 0, transferred: 0, abandoned: 0, total: 0 },
  );
  return t;
}

export const analytics: Record<
  RangeKey,
  {
    series: DayPoint[];
    totals: ReturnType<typeof summarise>;
    avgHandle: string;
    prevResolvedPct: number;
    languages: Array<{ language: Language; share: number }>;
  }
> = {
  "7d": { series: d7, totals: summarise(d7), avgHandle: "2:44", prevResolvedPct: 54.8, languages: [{ language: "English", share: 46 }, { language: "Setswana", share: 32 }, { language: "Mixed", share: 22 }] },
  "30d": { series: d30, totals: summarise(d30), avgHandle: "2:51", prevResolvedPct: 51.9, languages: [{ language: "English", share: 48 }, { language: "Setswana", share: 31 }, { language: "Mixed", share: 21 }] },
  "90d": { series: d90, totals: summarise(d90), avgHandle: "3:02", prevResolvedPct: 47.3, languages: [{ language: "English", share: 50 }, { language: "Setswana", share: 29 }, { language: "Mixed", share: 21 }] },
};

/* ---------------- Settings defaults ---------------- */

export type AgentSettings = {
  name: string;
  active: boolean;
  welcome: string;
  tone: "Warm & professional" | "Concise" | "Friendly & casual";
  languages: string[];
  hoursMode: "24/7" | "Business hours";
  hoursFrom: string;
  hoursTo: string;
  handoff: "On request" | "After 2 failed answers" | "For billing disputes";
};

export const defaultAgentSettings: AgentSettings = {
  name: "Lesedi",
  active: true,
  welcome: "Dumela! You've reached our support line. How can I help you today?",
  tone: "Warm & professional",
  languages: ["English", "Setswana"],
  hoursMode: "24/7",
  hoursFrom: "08:00",
  hoursTo: "17:00",
  handoff: "On request",
};

export const languageOptions = ["English", "Setswana"];

export type OrgSettings = {
  orgName: string;
  greeting: string;
  channels: Record<Channel, boolean>;
  handoffEmail: string;
  handoffHours: string;
};

export const defaultOrgSettings = (orgName: string): OrgSettings => ({
  orgName,
  greeting: "Thank you for calling. Lesedi will help you right away, in English or Setswana.",
  channels: { "Phone call": true, "Web call": true, "In-app (concept)": false },
  handoffEmail: "support-team@example.org",
  handoffHours: "Weekdays 08:00–17:00",
});

export const teamMembers = [
  { name: "Kagiso M.", role: "Administrator", initials: "KM", lastActive: "Now" },
  { name: "Boitumelo S.", role: "Knowledge editor", initials: "BS", lastActive: "12 min ago" },
  { name: "Tumo R.", role: "Support team lead", initials: "TR", lastActive: "1 h ago" },
  { name: "Naledi P.", role: "Viewer", initials: "NP", lastActive: "Yesterday" },
];

/** Workspace usage shown in the sidebar footer. */
export const usage = { minutesUsed: 8412, minutesIncluded: 20000, period: "Oct" };
