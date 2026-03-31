# Claude Session Protocol — GSprint

### MANDATORY DEBUGGING RULE
When a bug occurs and the fix isn't obvious: **NEVER guess.** Add error logging, tell user what to run, fix based on the ACTUAL error.

### MANDATORY STOPPING RULES
When told to "wait for approval/feedback" or "ask the user": STOP generating immediately. Do NOT output the next phase or anticipate answers.

Follow phases IN ORDER. Always print the phase name exactly (e.g., "PHASE 1: Load Context").

---

## What This App Is

**"The visual sprint board for gstack."** A native macOS desktop app that visualizes Garry Tan's [gstack](https://github.com/garrytan/gstack) sprint process. Built with [Keel & Deck](https://github.com/ja-818/keel-and-deck), consuming @deck-ui packages from npm and keel-* crates from crates.io.

The app uses a **sidebar + two-view** model:

### Sidebar
- Sprint list (like Houston shows projects)
- Uses `AppSidebar` from @deck-ui/layout
- Each sprint shows: name + phase badge (Planning / Executing / Done)
- "New Sprint" button at the bottom

### Planning View (sprint phase = "planning")
- Stepper at top: Office Hours -> CEO Review -> Eng Review -> Design Review
- ChatPanel below for conversation with the planning agent
- Agent runs each sub-phase in sequence
- When all 4 steps complete, agent proposes execution tickets
- User approves -> sprint moves to "executing" phase

### Execution View (sprint phase = "executing")
- KanbanBoard with columns: Running, Review, Done
- Each card is a ticket generated from planning
- Click card -> SplitView with ChatPanel (like Houston's issue detail)
- Each ticket has its own mini-lifecycle: Build -> Review -> Test -> Ship -> Reflect
- Multiple tickets can run in parallel with different agents

### Key Constraints
- **Sidebar + two-view model** — sidebar shows sprints, main area shows planning or execution view
- **Brand: YC Orange** `#ff6600` as primary color, via CSS custom property override
- **Use @deck-ui components for everything** — if a component doesn't exist, build it in the library first
- **Parallel sprints** — multiple sprints can run simultaneously at different phases
- **Working directory**: `~/Documents/GSprint/`

---

## PHASE 1: Load Context (Session Start Only)

1. Print "PHASE 1: Load Context"
2. Read ALL knowledge base files:
   - `/knowledge-base/architecture.md` — app structure, component usage, sprint model
   - `/knowledge-base/frameworks.md` — Tauri 2, Keel & Deck patterns, view routing
   - `/knowledge-base/design.md` — YC Orange brand, layout, view styling
3. Briefly acknowledge what you loaded
4. Then proceed to Phase 2

---

## PHASE 2: Understand the Request

1. Print "PHASE 2: Understand the Request"
2. Read any files the user references
3. Ask clarifying questions if ANYTHING is unclear
4. **STOP AND WAIT.**

---

## PHASE 3: Challenge

1. Print "PHASE 3: Challenge"
2. Before planning:
   - **Does this belong in GSprint or in @deck-ui?** If it's reusable, it should be a library component.
   - **Is there an existing @deck-ui component?** Search before building.
   - **Which view does it affect?** Sidebar, planning view, or execution view?
3. If better approach exists: Say so clearly.
4. If sound: Say "Approach looks sound".
5. **STOP AND WAIT.**

---

## PHASE 4: Plan

1. Print "PHASE 4: Plan"
2. Create a numbered plan with testable chunks
3. **STOP AND WAIT.**

---

## PHASE 5: Execute

1. Print "PHASE 5: Execute — [chunk description]"
2. Do all steps in the chunk
3. Proceed to Phase 6

---

## PHASE 6: Test

1. Print "PHASE 6: Test"
2. Run `pnpm tsc --noEmit` for TypeScript
3. Run `cd src-tauri && cargo check` for Rust
4. Fix any failures
5. Proceed to Phase 7

---

## PHASE 7: Verify

1. Print "PHASE 7: Verify"
2. Say "Ready for testing — please verify"
3. **STOP AND WAIT.**

---

## PHASE 8: Refactor

1. Print "PHASE 8: Refactor"
2. Check: file size limits, code in right place, duplication
3. If refactor needed: propose and do after approval
4. If not: "No refactor needed"

---

## PHASE 9: Cleanup

1. Print "PHASE 9: Cleanup"
2. Unused imports, dead code, debug artifacts
3. "No cleanup needed" or fix

---

## PHASE 10: Complete

1. Print "PHASE 10: Complete"
2. Summarize, evaluate knowledge base updates
3. If component was built: consider if it should be extracted to @deck-ui

---

## PHASE 11: Commit

1. Print "PHASE 11: Commit"
2. "Ready to commit? (yes/no/skip)"
3. **STOP AND WAIT.**

---

# Code Quality Rules

## Use @deck-ui Components
Every UI element should come from the library. If a component doesn't exist, build it in @deck-ui first, then consume it.

## Sidebar + Two-View Model
Sidebar always shows the sprint list. Main area shows the planning view or execution view depending on the selected sprint's phase. Never show a flat kanban as the primary view.

## Parallel Sprints Are First-Class
Multiple sprints can exist at different phases simultaneously. Never assume one active sprint.

## File Size Limits
200 lines max per file (CSS: 500). Extract, don't compress.

## No Silent Failures
Errors surface to the user. No swallowed errors.

## No Hover-Only Affordances
All interactive elements must be visible without hovering.

## Brand Color via Tokens
Never hardcode `#ff6600`. Always use `bg-primary`, `text-primary-foreground`, etc.

---

# Gotchas (Hard-Won)

## React Hooks After Early Returns
**NEVER** put `useCallback`, `useMemo`, or any hook inside JSX or after an early `return`. React requires the same number of hooks on every render. If you have an early return (like a loading state), all hooks must be called BEFORE it.

## Tauri Window Dragging
- Requires `core:window:allow-start-dragging` in `capabilities/default.json`
- Use dynamic import for `@tauri-apps/api/window` (static import crashes the app)
- Set `cursor-default select-none` on drag region; exclude interactive children via `target.closest("button, a, input")`

## Tauri Overlay Title Bar
- `"titleBarStyle": "Overlay"` and `"title": ""` in tauri.conf.json; add `pl-[78px]` for macOS traffic lights

## CSS Theme Override
- Override in globals.css AFTER importing `@deck-ui/core/src/globals.css` using `@theme { --color-primary: #ff6600; }` block

## Empty States
- Use `Empty` from `@deck-ui/core` — big title, description, optional action button, centered vertically
- All containers must be `flex flex-col` for `flex-1 justify-center` to work
