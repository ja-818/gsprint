# GSprint — Framework Patterns

---

## Keel & Deck

GSprint consumes @deck-ui packages from npm and keel-* crates from crates.io.

### Theme Override Pattern
Override CSS custom properties after importing core's globals.css:
```css
@import "@deck-ui/core/src/globals.css";

@theme {
  --color-primary: #22c55e;
  --color-primary-foreground: #ffffff;
  --color-ring: #22c55e;
}
```
Every component using `bg-primary`, `text-primary-foreground`, etc. will use the green brand color.

### Workspace Store Pattern
No project picker — auto-create on first launch:
```typescript
const projects = await tauriProjects.list();
let ws = projects.find((p) => p.name === "GSprint") ?? null;
if (!ws) ws = await tauriProjects.create("GSprint", "~");
```

### KanbanBoard with Custom Columns
The KanbanBoard component from @deck-ui/board accepts custom column definitions. GSprint maps the 7 gstack phases to board columns:
```typescript
const columns = SPRINT_PHASES.map((phase) => ({
  id: phase.id,
  title: phase.label,
  items: sprints.filter((s) => s.currentPhase === phase.id),
}));
```

---

## gstack Integration

### Phase-to-Command Mapping
Each sprint phase maps to a gstack command. When a sprint enters a phase, GSprint can trigger the corresponding gstack action:

| Phase | gstack Command | Description |
|-------|---------------|-------------|
| Think | `/office-hours` | Brainstorm, explore problem space |
| Plan | `/plan-*` | Define scope, break into tasks |
| Build | (none) | Active development |
| Review | `/review` | Code review, design review |
| Test | `/qa` | Quality assurance |
| Ship | `/ship` | Deploy, release |
| Reflect | `/retro` | Retrospective, learnings |

### Sprint Lifecycle
A sprint is created in the Think column and moves rightward through phases. Sprints can be paused, and multiple sprints run in parallel at different phases.

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

### ViewMode defaults to "board"
Unlike DesktopClaw (which defaults to chat), GSprint defaults to the board view:
```typescript
type ViewMode = "board" | "events" | "memory" | "retro";
viewMode: ViewMode; // defaults to "board", never null
```

### Feed store is per-sprint
Each sprint has its own feed. The feed store keys items by sprint ID:
```typescript
feeds: Record<string, FeedItem[]>;
```

---

## Gotchas

1. **`@tauri-apps/api/window` import**: Use dynamic import in app code, NOT static. Never import in library code.
2. **Capabilities**: `core:default` does NOT include `start-dragging`. Add explicitly.
3. **CSS imports order**: `@deck-ui/core/src/globals.css` must come before theme overrides.
4. **Empty title**: Set `"title": ""` in tauri.conf.json to hide native title (overlay mode shows it otherwise).
5. **pnpm-lock.yaml**: Delete and reinstall when bumping @deck-ui versions (`^` range may cache old).
