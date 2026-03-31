# GSprint — Framework Patterns

---

## Keel & Deck

GSprint consumes @deck-ui packages from npm and keel-* crates from crates.io.

### Theme Override Pattern
Override CSS custom properties after importing core's globals.css:
```css
@import "@deck-ui/core/src/globals.css";

@theme {
  --color-primary: #ff6600;
  --color-primary-foreground: #ffffff;
  --color-ring: #ff6600;
}
```
Every component using `bg-primary`, `text-primary-foreground`, etc. will use the YC Orange brand color.

### Workspace Store Pattern
No project picker — auto-create on first launch:
```typescript
const projects = await tauriProjects.list();
let ws = projects.find((p) => p.name === "GSprint") ?? null;
if (!ws) ws = await tauriProjects.create("GSprint", "~/Documents/GSprint");
```

### AppSidebar for Sprint List
AppSidebar from @deck-ui/layout renders the sprint list. Each item shows name + phase badge:
```typescript
<AppSidebar
  items={sprints.map((s) => ({
    id: s.id,
    label: s.name,
    badge: s.phase,        // "planning" | "executing" | "done"
    active: s.id === selectedSprintId,
  }))}
  onSelect={(id) => selectSprint(id)}
  footer={<NewSprintButton />}
/>
```

### Stepper for Planning Progress
Stepper from @deck-ui/core shows horizontal progress through planning sub-steps:
```typescript
const PLANNING_STEPS = [
  { id: "office-hours", label: "Office Hours" },
  { id: "ceo-review",   label: "CEO Review" },
  { id: "eng-review",   label: "Eng Review" },
  { id: "design-review", label: "Design Review" },
];

<Stepper
  steps={PLANNING_STEPS}
  currentStep={sprint.planningStep}
  completedSteps={sprint.completedPlanningSteps}
/>
```

### KanbanBoard for Execution Tickets
KanbanBoard from @deck-ui/board shows tickets in 3 columns during execution:
```typescript
const columns = [
  { id: "running", title: "Running", items: tickets.filter((t) => t.status === "running") },
  { id: "review",  title: "Review",  items: tickets.filter((t) => t.status === "review") },
  { id: "done",    title: "Done",    items: tickets.filter((t) => t.status === "done") },
];
```

### SplitView for Ticket Detail
Click a ticket card to open SplitView with ChatPanel (same pattern as Houston's issue detail):
```typescript
<SplitView>
  <KanbanBoard columns={columns} onSelect={selectTicket} />
  {selectedTicket && <ChatPanel feedId={selectedTicket.id} />}
</SplitView>
```

---

## View Routing

The main area renders based on selected sprint's phase:
```typescript
function MainView({ sprint }: { sprint: Sprint }) {
  if (sprint.phase === "planning") return <PlanningView sprint={sprint} />;
  if (sprint.phase === "executing") return <ExecutionView sprint={sprint} />;
  return <DoneView sprint={sprint} />;
}
```

---

## Tauri 2

### Overlay Title Bar + Window Dragging
- `tauri.conf.json`: `"titleBarStyle": "Overlay"`, `"title": ""`
- Capability: `"core:window:allow-start-dragging"`
- AppTopBar `onDrag` prop calls `getCurrentWindow().startDragging()`
- Interactive children (buttons) are excluded via `target.closest("button, a, input")`
- **Always use dynamic import** for `@tauri-apps/api/window` — static import can crash the app

### Commands return `Result<T, String>`
All Tauri commands use `map_err(|e| e.to_string())` pattern. Frontend gets error as string.

---

## React / Zustand

### Feed store is per-sprint AND per-ticket
Each sprint and each ticket has its own feed. The feed store keys items by entity ID:
```typescript
feeds: Record<string, FeedItem[]>;
// Key is sprint ID (for planning chat) or ticket ID (for execution chat)
```

---

## Gotchas

1. **`@tauri-apps/api/window` import**: Use dynamic import in app code, NOT static.
2. **Capabilities**: `core:default` does NOT include `start-dragging`. Add explicitly.
3. **CSS imports order**: `@deck-ui/core/src/globals.css` must come before theme overrides.
4. **Empty title**: Set `"title": ""` in tauri.conf.json to hide native title.
5. **pnpm-lock.yaml**: Delete and reinstall when bumping @deck-ui versions.
