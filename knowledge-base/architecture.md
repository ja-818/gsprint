# GSprint — Architecture

## What This Is

"The visual sprint board for gstack" — a native macOS desktop app that visualizes Garry Tan's gstack sprint process as an interactive kanban board. Built with Keel & Deck, each sprint flows through 7 phases: Think, Plan, Build, Review, Test, Ship, Reflect.

## Origin

Scaffolded from `create-keel-and-deck-app`, then customized for a board-first layout. GSprint has no sidebar and no default chat view — the kanban board is the primary interface.

---

## App Structure

```
gsprint/
├── src/
│   ├── App.tsx                  Main app shell (AppTopBar + NavPills + board + panels)
│   ├── main.tsx                 React entry point
│   ├── env.d.ts                 CSS module declarations
│   ├── config/
│   │   └── sprint-phases.ts     7 gstack phases: Think→Plan→Build→Review→Test→Ship→Reflect
│   ├── hooks/
│   │   └── use-session-events.ts  Tauri event listener → Zustand stores
│   ├── lib/
│   │   ├── tauri.ts             Type-safe Tauri invoke wrappers
│   │   └── types.ts             Domain types (Sprint, Phase, SprintCard)
│   ├── stores/
│   │   ├── ui.ts                ViewMode: "board" | "events" | "memory" | "retro"
│   │   ├── workspace.ts         Single implicit workspace (auto-created on launch)
│   │   ├── issues.ts            Sprint cards / tasks within sprints
│   │   ├── feeds.ts             Chat feed items (streaming, per-sprint)
│   │   ├── events.ts            Event log entries
│   │   └── memory.ts            Agent memories / sprint learnings
│   └── styles/
│       └── globals.css          Tailwind + deck-ui tokens + green brand override
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

## Key Architectural Decisions

### Board-first layout
The kanban board is always visible at full width. No sidebar, no default chat. When a sprint card is selected, chat opens in a SplitView panel showing that sprint's conversation.

### Sprint phases as columns
The board has 7 fixed columns matching gstack phases. Each column corresponds to a gstack command. Sprint cards move through columns as work progresses.

### Parallel sprints
Multiple sprints can exist simultaneously at different phases. The board shows all active sprints, each as a card in its current phase column.

### NavPills for secondary views
NavPills toggle between secondary panels: Events (activity log), Memory (learnings), Retro (retrospectives). These open alongside the board via SplitView.

### ViewMode
```typescript
type ViewMode = "board" | "events" | "memory" | "retro";
// "board" is the default — always starts here
```

---

## Component Usage

| @deck-ui Package | Components Used |
|-----------------|----------------|
| layout | AppTopBar, NavPills, SplitView |
| board | KanbanBoard |
| chat | ChatPanel |
| events | EventFeed |
| memory | MemoryBrowser |
| core | Empty, EmptyHeader, EmptyTitle, EmptyDescription |

---

## Sprint Phase Config

```typescript
// config/sprint-phases.ts
const SPRINT_PHASES = [
  { id: "think",   label: "Think",   gstackCmd: "/office-hours" },
  { id: "plan",    label: "Plan",    gstackCmd: "/plan-*" },
  { id: "build",   label: "Build",   gstackCmd: null },
  { id: "review",  label: "Review",  gstackCmd: "/review" },
  { id: "test",    label: "Test",    gstackCmd: "/qa" },
  { id: "ship",    label: "Ship",    gstackCmd: "/ship" },
  { id: "reflect", label: "Reflect", gstackCmd: "/retro" },
] as const;
```

---

## Event Flow

```
Rust backend → emit("keel-event", KeelEvent::*) → Frontend listens → Zustand stores update → React re-renders
```

KeelEvent types: FeedItem, SessionStatus, IssueStatusChanged, IssuesChanged, Toast, EventReceived, EventProcessed, SprintPhaseChanged, MemoryChanged, MemoryDeleted.
