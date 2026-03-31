# GSprint — Architecture

## What This Is

"The visual sprint board for gstack" — a native macOS desktop app that visualizes Garry Tan's gstack sprint process. Built with Keel & Deck. Uses a sidebar + two-view model: planning view (stepper + chat) and execution view (kanban + chat per ticket).

## Working Directory

`~/Documents/GSprint/`

---

## App Structure

```
gsprint/
├── src/
│   ├── App.tsx                  Main app shell (AppSidebar + view router)
│   ├── main.tsx                 React entry point
│   ├── env.d.ts                 CSS module declarations
│   ├── config/
│   │   └── planning-steps.ts    4 planning sub-steps: Office Hours, CEO, Eng, Design Review
│   ├── hooks/
│   │   └── use-session-events.ts  Tauri event listener → Zustand stores
│   ├── lib/
│   │   ├── tauri.ts             Type-safe Tauri invoke wrappers
│   │   └── types.ts             Domain types (Sprint, Ticket, Phase)
│   ├── stores/
│   │   ├── ui.ts                Selected sprint, selected ticket
│   │   ├── workspace.ts         Single implicit workspace (auto-created on launch)
│   │   ├── sprints.ts           Sprint list, phase transitions
│   │   ├── tickets.ts           Execution tickets (children of sprints)
│   │   ├── feeds.ts             Chat feed items (per-sprint and per-ticket)
│   │   └── events.ts            Event log entries
│   └── styles/
│       └── globals.css          Tailwind + deck-ui tokens + YC Orange override
├── src-tauri/
│   ├── src/
│   │   ├── main.rs              Tauri entry point
│   │   ├── lib.rs               Setup: DB, memory store, event queue, scheduler
│   │   └── commands/            Tauri command handlers
│   ├── Cargo.toml               Rust deps (keel-* crates from crates.io)
│   ├── tauri.conf.json          Overlay title bar, empty title, 1200x800
│   └── capabilities/default.json  Permissions (events, window dragging)
├── knowledge-base/              Architecture, frameworks, design docs
├── CLAUDE.md                    Session protocol + code rules + gotchas
└── package.json                 @deck-ui packages from npm
```

---

## Sprint Model

```typescript
interface Sprint {
  id: string
  name: string
  phase: "planning" | "executing" | "done"
  planningStep: string            // current planning sub-step
  completedPlanningSteps: string[] // which steps are done
}

interface Ticket {
  id: string
  sprintId: string
  title: string
  status: "running" | "review" | "done"
  lifecycle: "build" | "review" | "test" | "ship" | "reflect"
}
```

---

## Key Architectural Decisions

### Sidebar for sprints
AppSidebar shows the sprint list. Each entry shows name + phase badge (Planning / Executing / Done). "New Sprint" button at the bottom.

### Two views per sprint
The main area renders one of two views based on the selected sprint's phase:
- **Planning view** — Stepper + ChatPanel for the linear planning flow
- **Execution view** — KanbanBoard + SplitView with ChatPanel per ticket

### Planning is a linear flow
4 sequential sub-steps: Office Hours, CEO Review, Eng Review, Design Review. The Stepper component shows progress. ChatPanel below handles the conversation. When all steps complete, the agent proposes execution tickets. User approves, sprint transitions to "executing".

### Execution reuses Houston's pattern
KanbanBoard with 3 columns (Running, Review, Done). Click a card to open SplitView with ChatPanel for that ticket's conversation. Each ticket has a mini-lifecycle: Build -> Review -> Test -> Ship -> Reflect.

### Tickets are children of sprints
Created after planning phase completes. Multiple tickets can run in parallel with different agents.

---

## Component Usage

| @deck-ui Package | Components Used |
|-----------------|----------------|
| layout | AppSidebar, AppTopBar, NavPills, SplitView |
| board | KanbanBoard |
| chat | ChatPanel |
| core | Stepper (NEW), Empty, EmptyHeader, EmptyTitle, EmptyDescription |

---

## Event Flow

```
Rust backend → emit("keel-event", KeelEvent::*) → Frontend listens → Zustand stores update → React re-renders
```

KeelEvent types: FeedItem, SessionStatus, IssueStatusChanged, IssuesChanged, Toast, SprintPhaseChanged, TicketStatusChanged, PlanningStepChanged.
