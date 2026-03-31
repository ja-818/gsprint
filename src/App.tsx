import { useEffect, useState, useCallback } from "react";
import { AppTopBar, NavPills, SplitView } from "@deck-ui/layout";
import { KanbanBoard } from "@deck-ui/board";
import { ChatPanel } from "@deck-ui/chat";
import { EventFeed } from "@deck-ui/events";
import { MemoryBrowser } from "@deck-ui/memory";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@deck-ui/core";
import { useUIStore, type ViewMode } from "./stores/ui";
import { useWorkspaceStore } from "./stores/workspace";
import { useIssueStore } from "./stores/issues";
import { useFeedStore } from "./stores/feeds";
import { useEventStore } from "./stores/events";
import { useMemoryStore } from "./stores/memory";
import { useSessionEvents } from "./hooks/use-session-events";
import { SPRINT_PHASES } from "./config/sprint-phases";
import type { KanbanItem, KanbanColumnConfig } from "@deck-ui/board";

const COLUMNS: KanbanColumnConfig[] = SPRINT_PHASES.map((phase) => ({
  id: phase.id,
  label: phase.label,
  statuses: [phase.id],
}));

const NAV_ITEMS = [
  { id: "events", label: "Events" },
  { id: "memory", label: "Memory" },
  { id: "retro", label: "Retro" },
];

export function App() {
  const { viewMode, setViewMode, agentName } = useUIStore();
  const { workspace, ready, init } = useWorkspaceStore();
  const { issues, loadIssues } = useIssueStore();
  const feedItems = useFeedStore((s) => s.items);
  const events = useEventStore((s) => s.events);
  const { memories, loading: memoriesLoading, loadMemories } = useMemoryStore();
  const [selectedSprint, setSelectedSprint] = useState<KanbanItem | null>(null);
  const handleDrag = useCallback(async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    getCurrentWindow().startDragging();
  }, []);

  useSessionEvents();

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (workspace) {
      loadIssues(workspace.id);
      loadMemories(workspace.id);
    }
  }, [workspace, loadIssues, loadMemories]);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground text-sm">Starting {agentName}...</p>
      </div>
    );
  }

  const kanbanItems: KanbanItem[] = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    subtitle: issue.description,
    status: issue.status,
    updatedAt: issue.updated_at,
  }));

  const sprintBoard = (
    <KanbanBoard
      columns={COLUMNS}
      items={kanbanItems}
      onSelect={(item) => setSelectedSprint(item)}
      runningStatuses={["build", "review", "test"]}
      emptyState={
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyTitle>No sprints yet</EmptyTitle>
            <EmptyDescription>
              Create a sprint to start the gstack process: Think, Plan, Build, Review, Test, Ship, Reflect
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );

  const hasPanel = viewMode !== "board" || selectedSprint !== null;

  const sidePanel = selectedSprint ? (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex items-center justify-between h-10 px-4 border-b border-border shrink-0">
        <span className="text-sm font-medium">{selectedSprint.title}</span>
        <button
          onClick={() => setSelectedSprint(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
      <ChatPanel
        sessionKey={selectedSprint.id}
        feedItems={feedItems[selectedSprint.id] ?? []}
        isLoading={false}
        onSend={() => {}}
        placeholder="Run a gstack command..."
      />
    </div>
  ) : viewMode === "events" ? (
    <EventFeed events={events} emptyMessage="Sprint events will appear here." />
  ) : viewMode === "memory" ? (
    <MemoryBrowser memories={memories} loading={memoriesLoading} emptyMessage="Sprint learnings will be stored here." />
  ) : viewMode === "retro" ? (
    <Empty className="flex-1 border-0">
      <EmptyHeader>
        <EmptyTitle>Sprint Retrospective</EmptyTitle>
        <EmptyDescription>Run /retro in a sprint to generate a retrospective.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ) : null;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <AppTopBar
        trafficLightPadding
        onDrag={handleDrag}
        title={<span className="text-sm font-semibold">{agentName}</span>}
        navigation={
          <NavPills
            items={NAV_ITEMS}
            activeId={viewMode === "board" ? null : viewMode}
            onChange={(id) => {
              setViewMode(id ? (id as ViewMode) : "board");
              if (id) setSelectedSprint(null);
            }}
          />
        }
      />
      <div className="flex-1 min-h-0">
        {hasPanel ? (
          <SplitView left={sprintBoard} right={sidePanel!} />
        ) : (
          sprintBoard
        )}
      </div>
    </div>
  );
}
