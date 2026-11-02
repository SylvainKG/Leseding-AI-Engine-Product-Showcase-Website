/**
 * Wording for the "How it works" flow — the header button that opens an
 * animated diagram of a call travelling through Leseding AI Engine.
 *
 * Edit labels and captions here; the diagram and its step captions read
 * from this file. Keep claims in line with what the product actually does
 * (see "Content and honesty rules" in the README).
 *
 * </ABM>
 */

export type FlowNodeId = "customer" | "stt" | "brain" | "kb" | "compose" | "ai" | "human";
export type FlowOutcome = "ai" | "human";

export const howItWorksCopy = {
  button: "How it works",
  intro: "Follow one call from the customer's first word to the answer.",

  /** Labels drawn on the diagram. `sub` is an optional second, smaller line. */
  nodes: {
    customer: { label: "Customer speaks", sub: "Setswana or English" },
    stt: { label: "Speech to text" },
    brain: { label: "Reasoning brain" },
    kb: { label: "Client knowledge base" },
    compose: { label: "Response" },
    ai: { label: "Leseding AI responds", sub: "Spoken answer" },
    human: { label: "Human agent", sub: "When escalated" },
  } satisfies Record<FlowNodeId, { label: string; sub?: string }>,

  /** One caption per step, shown under the diagram as the voice wave moves. */
  steps: [
    { title: "Customer speaks", text: "A customer calls in and speaks naturally, in Setswana or English." },
    { title: "Speech to text", text: "Leseding turns the caller's voice into text it can understand." },
    {
      title: "Reasoning brain",
      text: "The reasoning brain works out what the customer needs and checks the organisation's own knowledge base.",
    },
    { title: "Response", text: "Leseding prepares a clear answer from the organisation's own information." },
  ],

  /** The last step depends on how the call ends. */
  outcomes: {
    ai: { title: "Leseding AI responds", text: "The answer is spoken back to the customer, in their language." },
    human: {
      title: "Escalated to a human agent",
      text: "When a person is needed, the call goes to a human agent with a summary, so the customer doesn't repeat themselves.",
    },
  } satisfies Record<FlowOutcome, { title: string; text: string }>,

  /** The ending picker under the diagram. */
  endingLabel: "Ending",
  endings: { alternate: "Alternate", ai: "AI responds", human: "Human agent" },

  /**
   * Pictures for the people and the engine (files in /public/how-it-works).
   * People are square photos shown in a circle. The engine is a transparent
   * cut-out split in two layers: the orange core, and the ring of ticks that
   * spins while Leseding is responding. To use a single engine picture,
   * point `aiCore` at it and set `aiTicks` to "".
   */
  images: {
    customer: "/how-it-works/customer.webp",
    human: "/how-it-works/human-agent.webp",
    aiCore: "/how-it-works/leseding-ai-core.webp",
    aiTicks: "/how-it-works/leseding-ai-ticks.webp",
  },
};
