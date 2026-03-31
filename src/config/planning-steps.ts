export interface PlanningStep {
  id: string;
  label: string;
  description: string;
  gstackCommand: string;
}

export const PLANNING_STEPS: PlanningStep[] = [
  { id: "office-hours", label: "Office Hours", description: "Explore the problem space", gstackCommand: "/office-hours" },
  { id: "ceo-review", label: "CEO Review", description: "Product direction and scope", gstackCommand: "/plan-ceo-review" },
  { id: "eng-review", label: "Eng Review", description: "Architecture and technical plan", gstackCommand: "/plan-eng-review" },
  { id: "design-review", label: "Design Review", description: "Design system and UX", gstackCommand: "/plan-design-review" },
];

export const TICKET_PHASES = ["build", "review", "test", "ship", "reflect"] as const;
export type TicketPhase = (typeof TICKET_PHASES)[number];
