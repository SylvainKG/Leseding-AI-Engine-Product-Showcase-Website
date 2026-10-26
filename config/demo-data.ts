/**
 * Fictional sample data for the simulated organisation dashboard.
 * Nothing here is real customer data, pilot results or live telemetry.
 */

export type Channel = "Phone call" | "Web call" | "In-app (concept)";
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

/* ---------------- Overview ---------------- */

export const overviewKpis = [
  { id: "conversations", label: "Conversations", value: "1,284", delta: "+12%", trend: "up" as const },
  { id: "ai-handled", label: "AI-handled", value: "86%", delta: "+4 pts", trend: "up" as const },
  { id: "escalated", label: "Escalated to human", value: "179", delta: "−6%", trend: "down" as const },
  { id: "response", label: "Avg. response time", value: "1.8 s", delta: "−0.3 s", trend: "down" as const },
];

export const recentActivity = [
  { id: 1, title: "Billing question resolved", meta: "LSD-20417 · Phone call", time: "2 min ago", status: "Resolved" },
  { id: 2, title: "Handoff to support team", meta: "LSD-20416 · Web call", time: "6 min ago", status: "Escalated" },
  { id: 3, title: "Knowledge entry updated", meta: "Prepaid top-up guide", time: "18 min ago", status: "Updated" },
  { id: 4, title: "Outage enquiry answered", meta: "LSD-20413 · Phone call", time: "24 min ago", status: "Resolved" },
];

export const channelSummary = [
  { channel: "Phone call", share: 58 },
  { channel: "Web call", share: 31 },
  { channel: "In-app (concept)", share: 11 },
];

/* ---------------- Knowledge base ---------------- */

export type KbStatus = "Published" | "Draft" | "Needs review";

export type KbEntry = {
  id: string;
  name: string;
  category: Category;
  status: KbStatus;
  updated: string;
  summary: string;
  simulated?: boolean;
};

export const kbEntries: KbEntry[] = [
  {
    id: "kb-1",
    name: "How to check your account balance",
    category: "Account information",
    status: "Published",
    updated: "12 Oct 2026",
    summary: "Steps customers can follow to view their balance via USSD, the app, or a branch. Sample entry.",
  },
  {
    id: "kb-2",
    name: "Prepaid top-up guide",
    category: "Billing",
    status: "Published",
    updated: "20 Oct 2026",
    summary: "Available top-up options and what to do if a top-up does not reflect. Sample entry.",
  },
  {
    id: "kb-3",
    name: "Service outage — what to tell customers",
    category: "Technical support",
    status: "Needs review",
    updated: "22 Oct 2026",
    summary: "Approved wording for planned and unplanned outages, with escalation guidance. Sample entry.",
  },
  {
    id: "kb-4",
    name: "Data bundle troubleshooting",
    category: "Technical support",
    status: "Published",
    updated: "18 Oct 2026",
    summary: "Checks to run when a bundle is active but data is not working. Sample entry.",
  },
  {
    id: "kb-5",
    name: "Product catalogue overview",
    category: "Product/service information",
    status: "Draft",
    updated: "24 Oct 2026",
    summary: "Short descriptions of each plan and who it suits. Sample entry.",
  },
  {
    id: "kb-6",
    name: "Opening hours and branch locations",
    category: "General enquiries",
    status: "Published",
    updated: "05 Oct 2026",
    summary: "Branch hours, public holiday hours and contact routes. Sample entry.",
  },
  {
    id: "kb-7",
    name: "Disputing a charge on your bill",
    category: "Billing",
    status: "Draft",
    updated: "25 Oct 2026",
    summary: "What information to collect and when to hand over to a human agent. Sample entry.",
  },
];

/* ---------------- Conversations ---------------- */

export type ConvStatus = "Resolved" | "Escalated" | "In progress";

export type Conversation = {
  ref: string;
  channel: Channel;
  date: string;
  topic: string;
  category: Category;
  status: ConvStatus;
  outcome: string;
  language: string;
  transcript: Array<{ who: "Customer" | "AI Agent" | "Support team"; text: string }>;
};

export const conversations: Conversation[] = [
  {
    ref: "LSD-20417",
    channel: "Phone call",
    date: "26 Oct · 13:52",
    topic: "Check account balance",
    category: "Account information",
    status: "Resolved",
    outcome: "Resolved by AI",
    language: "English",
    transcript: [
      { who: "Customer", text: "How can I check my account balance?" },
      { who: "AI Agent", text: "I can guide you through the available options. This is a sample conversation for demonstration." },
      { who: "Customer", text: "Can I do it without the app?" },
      { who: "AI Agent", text: "Yes — in this demo, the knowledge base lists a short code option and branch support." },
    ],
  },
  {
    ref: "LSD-20416",
    channel: "Web call",
    date: "26 Oct · 13:47",
    topic: "Disputed charge",
    category: "Billing",
    status: "Escalated",
    outcome: "Handed to support team",
    language: "Setswana / English",
    transcript: [
      { who: "Customer", text: "Dumela. There's a charge on my bill I don't recognise." },
      { who: "AI Agent", text: "Dumela! I'm sorry about that. Disputes need a team member, so I'll pass this on with a summary. (Demo)" },
      { who: "Support team", text: "Thanks for waiting — I have the summary and will take it from here. (Demo)" },
    ],
  },
  {
    ref: "LSD-20414",
    channel: "In-app (concept)",
    date: "26 Oct · 13:21",
    topic: "Data bundle not working",
    category: "Technical support",
    status: "Resolved",
    outcome: "Resolved by AI",
    language: "English",
    transcript: [
      { who: "Customer", text: "Why is my data bundle not working?" },
      { who: "AI Agent", text: "Let's check together. First, is mobile data switched on in your settings? (Demo)" },
      { who: "Customer", text: "It was off. Working now, thanks." },
    ],
  },
  {
    ref: "LSD-20413",
    channel: "Phone call",
    date: "26 Oct · 12:58",
    topic: "Outage in my area",
    category: "Technical support",
    status: "Resolved",
    outcome: "Resolved by AI",
    language: "Setswana",
    transcript: [
      { who: "Customer", text: "Is there an outage in Tlokweng today?" },
      { who: "AI Agent", text: "In this demo, there's planned maintenance listed until 15:00. I can send you an update when it's done." },
    ],
  },
  {
    ref: "LSD-20409",
    channel: "Web call",
    date: "26 Oct · 11:40",
    topic: "Plan comparison",
    category: "Product/service information",
    status: "In progress",
    outcome: "Awaiting customer",
    language: "English",
    transcript: [
      { who: "Customer", text: "Which plan is best for working from home?" },
      { who: "AI Agent", text: "It depends on how much video calling you do. Roughly how many hours a day? (Demo)" },
    ],
  },
  {
    ref: "LSD-20402",
    channel: "Phone call",
    date: "25 Oct · 16:15",
    topic: "Branch opening hours",
    category: "General enquiries",
    status: "Resolved",
    outcome: "Resolved by AI",
    language: "English",
    transcript: [
      { who: "Customer", text: "What time does the Main Mall branch close on Saturday?" },
      { who: "AI Agent", text: "In this sample data, it closes at 13:00 on Saturdays." },
    ],
  },
  {
    ref: "LSD-20398",
    channel: "In-app (concept)",
    date: "25 Oct · 10:03",
    topic: "Top-up not reflecting",
    category: "Billing",
    status: "Escalated",
    outcome: "Handed to support team",
    language: "Setswana / English",
    transcript: [
      { who: "Customer", text: "I topped up an hour ago and it's not showing." },
      { who: "AI Agent", text: "I'll pass this to the team with your reference so they can check it. (Demo)" },
    ],
  },
];

/* ---------------- Analytics ---------------- */

export type RangeKey = "7d" | "30d" | "90d";

export const ranges: Array<{ key: RangeKey; label: string }> = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
];

function series(n: number, base: number, amp: number, seed: number, labeler: (i: number) => string) {
  return Array.from({ length: n }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.9) * amp + Math.cos((i + seed) * 0.37) * amp * 0.6;
    const total = Math.round(base + wave + i * (base * 0.01));
    const escalated = Math.round(total * (0.12 + 0.03 * Math.sin(i + seed)));
    return { label: labeler(i), ai: total - escalated, escalated, total };
  });
}

function trend(n: number, start: number, seed: number, labeler: (i: number) => string) {
  return Array.from({ length: n }, (_, i) => ({
    label: labeler(i),
    minutes: +(start - (i / n) * 0.8 + Math.sin((i + seed) * 1.3) * 0.35).toFixed(1),
  }));
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const analytics: Record<
  RangeKey,
  {
    volume: Array<{ label: string; ai: number; escalated: number; total: number }>;
    categories: Array<{ name: Category; count: number }>;
    resolution: Array<{ label: string; minutes: number }>;
    totals: { conversations: number; aiShare: number; avgResolution: string };
  }
> = {
  "7d": {
    volume: series(7, 180, 30, 1, (i) => days[i]),
    categories: [
      { name: "Account information", count: 402 },
      { name: "Billing", count: 318 },
      { name: "Technical support", count: 276 },
      { name: "Product/service information", count: 171 },
      { name: "General enquiries", count: 117 },
    ],
    resolution: trend(7, 3.9, 2, (i) => days[i]),
    totals: { conversations: 1284, aiShare: 86, avgResolution: "3m 40s" },
  },
  "30d": {
    volume: series(30, 175, 40, 3, (i) => `${i + 1}`),
    categories: [
      { name: "Account information", count: 1690 },
      { name: "Technical support", count: 1312 },
      { name: "Billing", count: 1248 },
      { name: "Product/service information", count: 702 },
      { name: "General enquiries", count: 461 },
    ],
    resolution: trend(30, 4.1, 5, (i) => `${i + 1}`),
    totals: { conversations: 5413, aiShare: 84, avgResolution: "3m 55s" },
  },
  "90d": {
    volume: series(13, 1150, 160, 7, (i) => `W${i + 1}`),
    categories: [
      { name: "Account information", count: 4930 },
      { name: "Billing", count: 3984 },
      { name: "Technical support", count: 3870 },
      { name: "Product/service information", count: 2105 },
      { name: "General enquiries", count: 1402 },
    ],
    resolution: trend(13, 4.6, 9, (i) => `W${i + 1}`),
    totals: { conversations: 16291, aiShare: 81, avgResolution: "4m 10s" },
  },
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
  greeting: "Thank you for contacting us. Our assistant will help you right away.",
  channels: { "Phone call": true, "Web call": true, "In-app (concept)": false },
  handoffEmail: "support-team@example.org",
  handoffHours: "Weekdays 08:00–17:00",
});

export const teamMembers = [
  { name: "Kagiso M.", role: "Administrator", initials: "KM" },
  { name: "Boitumelo S.", role: "Knowledge editor", initials: "BS" },
  { name: "Tumo R.", role: "Support team lead", initials: "TR" },
  { name: "Naledi P.", role: "Viewer", initials: "NP" },
];
