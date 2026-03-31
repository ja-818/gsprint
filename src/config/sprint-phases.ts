export interface SprintPhase {
  id: string;
  label: string;
  description: string;
  gstackCommands: string[];
}

export const SPRINT_PHASES: SprintPhase[] = [
  {
    id: "think",
    label: "Think",
    description: "Product brainstorming and problem framing",
    gstackCommands: ["/office-hours"],
  },
  {
    id: "plan",
    label: "Plan",
    description: "CEO, engineering, and design review",
    gstackCommands: ["/plan-ceo-review", "/plan-eng-review", "/plan-design-review", "/autoplan"],
  },
  {
    id: "build",
    label: "Build",
    description: "Implementation with Claude Code",
    gstackCommands: [],
  },
  {
    id: "review",
    label: "Review",
    description: "Staff engineer code review",
    gstackCommands: ["/review", "/codex"],
  },
  {
    id: "test",
    label: "Test",
    description: "QA, security audit, benchmarks",
    gstackCommands: ["/qa", "/cso", "/benchmark"],
  },
  {
    id: "ship",
    label: "Ship",
    description: "PR, merge, deploy, verify",
    gstackCommands: ["/ship", "/land-and-deploy", "/canary"],
  },
  {
    id: "reflect",
    label: "Reflect",
    description: "Retrospective and learning",
    gstackCommands: ["/retro", "/learn"],
  },
];
