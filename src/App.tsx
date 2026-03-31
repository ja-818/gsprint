import { useEffect, useCallback } from "react";
import { AppSidebar } from "@deck-ui/layout";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@deck-ui/core";
import { useUIStore } from "./stores/ui";
import { useSprintStore } from "./stores/sprints";
import { useSessionEvents } from "./hooks/use-session-events";
import { PlanningView } from "./views/planning-view";
import { ExecutionView } from "./views/execution-view";
import type { Sprint } from "./stores/sprints";

export function App() {
  const { agentName } = useUIStore();
  const { sprints, selectedSprintId, loadSprints, createSprint, selectSprint } = useSprintStore();
  const handleDrag = useCallback(async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, [role='button']")) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    getCurrentWindow().startDragging();
  }, []);

  useSessionEvents();

  useEffect(() => { loadSprints(); }, [loadSprints]);

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId) ?? null;

  const handleCreateSprint = useCallback(async () => {
    const name = window.prompt("Sprint name:");
    if (!name) return;
    await createSprint(name);
  }, [createSprint]);

  return (
    <div className="h-screen flex bg-background text-foreground">
      <AppSidebar
        logo={<span className="text-sm font-semibold">{agentName}</span>}
        items={sprints.map((s) => ({ id: s.id, name: s.name }))}
        selectedId={selectedSprintId}
        onSelect={selectSprint}
        onAdd={handleCreateSprint}
        sectionLabel="Sprints"
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div
            onMouseDown={handleDrag}
            data-tauri-drag-region
            className="h-11 shrink-0 border-b border-border bg-secondary cursor-default select-none"
          />
          {!selectedSprint ? (
            <NoSprintSelected />
          ) : selectedSprint.phase === "planning" ? (
            <PlanningView sprint={selectedSprint} />
          ) : selectedSprint.phase === "executing" ? (
            <ExecutionView sprint={selectedSprint} />
          ) : (
            <DoneView sprint={selectedSprint} />
          )}
        </div>
      </AppSidebar>
    </div>
  );
}

function NoSprintSelected() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyTitle>Select or create a sprint</EmptyTitle>
          <EmptyDescription>
            Pick a sprint from the sidebar, or create a new one to get started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

function DoneView({ sprint }: { sprint: Sprint }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyTitle>{sprint.name} complete</EmptyTitle>
          <EmptyDescription>
            This sprint has finished. Check the retrospective or start a new one.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
