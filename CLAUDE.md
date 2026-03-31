# Claude Session Protocol — GSprint

### MANDATORY DEBUGGING RULE
When a bug occurs and the fix isn't immediately obvious: **NEVER guess.** Always:
1. Add error logging (try/catch, window.onerror, console.error, eprintln!, etc.)
2. Tell the user what to run and what output to share back
3. Fix based on the ACTUAL error, not assumptions

Guessing wastes time. Getting the real error is always faster.

### MANDATORY STOPPING RULES
Whenever this protocol tells you to "wait for approval", "wait for user feedback", or "ask the user", you MUST IMMEDIATELY STOP GENERATING YOUR RESPONSE.
- End your text output right there.
- Do NOT output the next phase.
- Do NOT anticipate the user's answer.
- You must physically stop your turn and return control to the user.

Follow these phases IN ORDER for every interaction. Do not skip phases.

**IMPORTANT: Always print the phase name exactly (e.g., "PHASE 1: Load Context") so the user knows we're following the protocol.**

---

## What This App Is

**"The visual sprint board for gstack."** A native macOS desktop app that visualizes Garry Tan's [gstack](https://github.com/garrytan/gstack) sprint process as an interactive kanban board. Built with [Keel & Deck](https://github.com/ja-818/keel-and-deck), consuming @deck-ui packages from npm and keel-* crates from crates.io.

The app should feel like an homage to gstack — surfacing the sprint methodology as a visual, tactile experience.

### gstack Sprint Phases
Every sprint flows through 7 phases, which map to gstack commands:
1. **Think** — `/office-hours` — brainstorm, explore the problem space
2. **Plan** — `/plan-*` — define scope, break into tasks
3. **Build** — active development
4. **Review** — `/review` — code review, design review
5. **Test** — `/qa` — quality assurance
6. **Ship** — `/ship` — deploy, release
7. **Reflect** — `/retro` — retrospective, learnings

### Key Constraints
- **Board-first layout** — the sprint kanban board is the main view, always visible
- **No sidebar** — clean, focused board layout
- **Brand: green** `#22c55e` as primary color (developer tool / terminal vibe), via CSS custom property override
- **Use @deck-ui components for everything** — if a component doesn't exist, build it in the library first, then consume it here
- **Parallel sprints** — multiple sprints can run simultaneously, each at different phases
- **Chat opens on card select** — selecting a sprint card opens a chat panel showing that sprint's conversation

---

## PHASE 1: Load Context (Session Start Only)

1. Print "PHASE 1: Load Context"
2. Read ALL knowledge base files:
   - `/knowledge-base/architecture.md` — app structure, component usage, stores
   - `/knowledge-base/frameworks.md` — Tauri 2, Keel & Deck patterns, gstack integration
   - `/knowledge-base/design.md` — green brand, board layout, phase styling
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
   - **Does it follow the board-first, parallel-sprints paradigm?**
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

## Sprint Board Is Primary
The board is the main view. Chat only appears when a sprint card is selected (via SplitView). Never make chat the default view.

## Parallel Sprints Are First-Class
Multiple sprints can exist at different phases simultaneously. Never assume one active sprint.

## File Size Limits
200 lines max per file (CSS: 500). Extract, don't compress.

## No Silent Failures
Errors surface to the user. No swallowed errors.

## No Hover-Only Affordances
All interactive elements must be visible without hovering.

## Brand Color via Tokens
Never hardcode `#22c55e`. Always use `bg-primary`, `text-primary-foreground`, etc.

---

# Gotchas (Hard-Won)

## React Hooks After Early Returns
**NEVER** put `useCallback`, `useMemo`, or any hook inside JSX or after an early `return`. React requires the same number of hooks on every render. If you have an early return (like a loading state), all hooks must be called BEFORE it.

## Tauri Window Dragging
- Requires `core:window:allow-start-dragging` in `capabilities/default.json`
- Use `onDrag` prop on `AppTopBar` with dynamic import: `const { getCurrentWindow } = await import("@tauri-apps/api/window")`
- Static top-level import of `@tauri-apps/api/window` can crash the app — always use dynamic import
- Set `cursor-default select-none` on the drag region to prevent text cursor
- Exclude interactive children from drag: `target.closest("button, a, input")`

## Tauri Overlay Title Bar
- Set `"titleBarStyle": "Overlay"` and `"title": ""` in tauri.conf.json
- Empty title prevents duplicate text (native title overlapping custom title)
- Add `pl-[78px]` padding for macOS traffic lights

## CSS Theme Override
- Override in globals.css AFTER importing `@deck-ui/core/src/globals.css`
- Use `@theme { --color-primary: #22c55e; }` block
- Components using `bg-primary`, `text-primary-foreground`, `ring` automatically pick up the color

## Empty States
- All use `Empty` from `@deck-ui/core` — big `text-2xl font-semibold` title, description, optional action button
- No icon-in-a-box pattern — just text, centered vertically
- All containers must be `flex flex-col` for `flex-1 justify-center` to work
