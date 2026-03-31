# GSprint — Design System

## Brand

GSprint uses the @deck-ui design system with a green brand override — developer tool / terminal vibe.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#22c55e` | Active NavPills, phase indicators, focus rings, action buttons |
| `--color-primary-foreground` | `#ffffff` | Text on primary backgrounds |
| `--color-ring` | `#22c55e` | Focus ring color |

All other tokens inherit from @deck-ui/core defaults (monochrome palette).

---

## Layout

```
┌──────────────────────────────────────────────┐
│ [traffic lights]     NavPills  │ bg-secondary │
├──────────────────────────────────────────────┤
│                                              │
│  KanbanBoard (7 phase columns, full width)   │
│  OR                                          │
│  SplitView: Board | ChatPanel (per-sprint)   │
│                                              │
└──────────────────────────────────────────────┘
```

- **No sidebar** — clean, board-focused layout
- **AppTopBar**: `bg-secondary`, 44px height, macOS traffic light padding
- **NavPills**: Toggle between Events, Memory, Retro panels
- **Board**: Full width when no card selected, left side in split view when card selected
- **Chat**: Right side of SplitView, shows selected sprint's conversation

---

## Sprint Board Styling

### Phase Columns
Each column represents a gstack phase. Columns have minimal headers showing the phase name.

### Sprint Cards
Cards in the board show sprint name, brief description, and phase progress indicator.

### Running Phase Glow
When a sprint is actively being worked on (agent processing), the card gets the `animate-glow` treatment — a subtle pulsing border using the primary green color. This provides visual feedback that the agent is working.

### Phase Progress
A horizontal indicator shows how far through the 7-phase pipeline a sprint has progressed.

---

## Empty States

All empty states use the `Empty` component from @deck-ui/core:
- **Big bold title**: `text-2xl font-semibold tracking-tight`
- **Description text**: `text-sm text-muted-foreground`
- **Optional action button**: Primary style, rounded-full
- **No icons in boxes** — just text, centered vertically
- **flex-1 justify-center** — vertically centered in whatever container

### Board Empty State
When no sprints exist: "Start a sprint" title, "Create your first sprint to begin the gstack process" description, "New Sprint" action button.

---

## Rules

1. **Green for interactive elements only.** Text, borders, backgrounds stay monochrome.
2. **Board is the primary view.** Chat only appears when a sprint card is selected.
3. **No sidebar, no project UI.** Single workspace, auto-created.
4. **Same empty state pattern everywhere.** Big title, description, optional button.
5. **Follow @deck-ui design system** for everything else (typography, spacing, shadows, animations).
6. **Phase columns are always visible.** Even empty columns show, maintaining the 7-phase structure.
