# GSprint — Design System

## Brand

GSprint uses the @deck-ui design system with a YC Orange brand override — YC brand identity.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#ff6600` | Active sidebar item, stepper progress, action buttons, focus rings |
| `--color-primary-foreground` | `#ffffff` | Text on primary backgrounds |
| `--color-ring` | `#ff6600` | Focus ring color |

All other tokens inherit from @deck-ui/core defaults (monochrome palette).

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│ [traffic lights]   GSprint   NavPills  │ bg-secondary │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │  Planning View (stepper + chat)          │
│ Sprint   │  OR                                      │
│ List     │  Execution View (kanban + ticket detail) │
│          │                                          │
│ [+ New]  │                                          │
├──────────┴──────────────────────────────────────────┤
```

- **AppSidebar**: Sprint list with phase badges, "New Sprint" button at bottom
- **AppTopBar**: `bg-secondary`, 44px height, macOS traffic light padding
- **NavPills**: Toggle between secondary panels if needed
- **Main area**: Switches between planning view and execution view per sprint

---

## Planning View

```
┌──────────────────────────────────────┐
│  ● Office Hours  ● CEO  ● Eng  ● Design  │  Stepper
├──────────────────────────────────────┤
│                                      │
│            ChatPanel                 │
│     (planning conversation)          │
│                                      │
└──────────────────────────────────────┘
```

- **Stepper** at top shows 4 planning sub-steps with progress indicators
- Completed steps show a checkmark, current step is highlighted in primary color
- **ChatPanel** fills remaining space below the stepper
- Agent drives the conversation through each sub-step sequentially
- After all steps: agent proposes tickets, user approves to move to execution

---

## Execution View

```
┌──────────────────────────────────────┐
│  Running  │  Review  │  Done         │  KanbanBoard (3 columns)
│  ┌─────┐  │  ┌─────┐ │  ┌─────┐     │
│  │ T-1 │  │  │ T-3 │ │  │ T-5 │     │
│  │ T-2 │  │  └─────┘ │  └─────┘     │
│  └─────┘  │          │              │
└──────────────────────────────────────┘
```

When a ticket is selected, splits into SplitView:
```
┌───────────────────┬──────────────────┐
│  KanbanBoard      │  ChatPanel       │
│  (3 columns)      │  (ticket chat)   │
│                   │                  │
└───────────────────┴──────────────────┘
```

### Ticket Cards
- Show ticket title and current lifecycle step (Build / Review / Test / Ship / Reflect)
- Running tickets get `animate-glow` treatment (pulsing primary-color border)
- Lifecycle badge shows which mini-step the ticket is on

---

## Phase Badges (Sidebar)

| Phase | Badge Style |
|-------|-------------|
| Planning | `bg-primary/10 text-primary` — orange tint |
| Executing | `bg-primary text-primary-foreground` — solid orange |
| Done | `bg-muted text-muted-foreground` — grey |

---

## Empty States

All empty states use the `Empty` component from @deck-ui/core:
- **Big bold title**: `text-2xl font-semibold tracking-tight`
- **Description text**: `text-sm text-muted-foreground`
- **Optional action button**: Primary style, rounded-full
- **No icons in boxes** — just text, centered vertically
- **flex-1 justify-center** — vertically centered in whatever container

### No Sprints Empty State
"Start a sprint" title, "Create your first sprint to begin planning" description, "New Sprint" action button.

### No Tickets Empty State (Execution View)
"No tickets yet" title, "Complete the planning phase to generate execution tickets" description.

---

## Rules

1. **Orange for interactive elements only.** Text, borders, backgrounds stay monochrome.
2. **Sidebar always visible.** Sprint list is the primary navigation.
3. **Planning view for planning phase.** Stepper + chat, never a kanban.
4. **Execution view for executing phase.** 3-column kanban + chat per ticket.
5. **Same empty state pattern everywhere.** Big title, description, optional button.
6. **Follow @deck-ui design system** for everything else (typography, spacing, shadows, animations).
