import { useState } from "react";
import { KanbanBoard, KanbanDetailPanel } from "@deck-ui/board";
import { ChatPanel } from "@deck-ui/chat";
import { SplitView } from "@deck-ui/layout";
import {
  Button, Empty, EmptyHeader, EmptyTitle, EmptyDescription,
} from "@deck-ui/core";
import { Plus } from "lucide-react";
import { useTicketStore } from "../stores/tickets";
import { useFeedStore } from "../stores/feeds";
import type { Sprint } from "../stores/sprints";
import type { KanbanItem, KanbanColumnConfig } from "@deck-ui/board";

const COLUMNS: KanbanColumnConfig[] = [
  { id: "running", label: "Running", statuses: ["build", "running"] },
  { id: "review", label: "Review", statuses: ["review", "test"] },
  { id: "done", label: "Done", statuses: ["ship", "reflect", "done"] },
];

interface ExecutionViewProps {
  sprint: Sprint;
}

export function ExecutionView({ sprint }: ExecutionViewProps) {
  const { tickets, createTicket } = useTicketStore();
  const feedItems = useFeedStore((s) => s.items);
  const [selectedTicket, setSelectedTicket] = useState<KanbanItem | null>(null);

  const sprintTickets = tickets.filter((t) => t.project_id === sprint.id);

  const kanbanItems: KanbanItem[] = sprintTickets.map((t) => ({
    id: t.id,
    title: t.title,
    subtitle: t.description,
    status: t.status || "build",
    updatedAt: t.updated_at,
  }));

  const handleCreateTicket = async () => {
    const name = window.prompt("Ticket title:");
    if (!name) return;
    await createTicket(sprint.id, name, "");
  };

  const board = (
    <KanbanBoard
      columns={COLUMNS}
      items={kanbanItems}
      onSelect={setSelectedTicket}
      runningStatuses={["build", "running"]}
      emptyState={
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyTitle>No tickets yet</EmptyTitle>
            <EmptyDescription>
              Tickets will be created from your planning phase, or add one manually.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={handleCreateTicket} className="rounded-full">
            <Plus className="size-4 mr-1.5" />
            Add Ticket
          </Button>
        </Empty>
      }
    />
  );

  if (selectedTicket) {
    return (
      <SplitView
        left={board}
        right={
          <KanbanDetailPanel
            title={selectedTicket.title}
            subtitle={selectedTicket.subtitle}
            onClose={() => setSelectedTicket(null)}
          >
            <ChatPanel
              sessionKey={`ticket-${selectedTicket.id}`}
              feedItems={feedItems[`ticket-${selectedTicket.id}`] ?? []}
              isLoading={false}
              onSend={() => {}}
              placeholder="Work on this ticket..."
            />
          </KanbanDetailPanel>
        }
      />
    );
  }

  return board;
}
