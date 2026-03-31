import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useFeedStore } from "../stores/feeds";
import { useTicketStore } from "../stores/tickets";
import { useSprintStore } from "../stores/sprints";
import type { KeelEvent } from "../lib/types";

export function useSessionEvents() {
  const pushFeedItem = useFeedStore((s) => s.pushFeedItem);
  const updateTicketStatus = useTicketStore((s) => s.updateTicketStatus);
  const loadSprints = useSprintStore((s) => s.loadSprints);
  const selectedSprintId = useSprintStore((s) => s.selectedSprintId);
  const loadTickets = useTicketStore((s) => s.loadTickets);

  useEffect(() => {
    const unlisten = listen<KeelEvent>("keel-event", (event) => {
      const payload = event.payload;

      switch (payload.type) {
        case "FeedItem":
          pushFeedItem(payload.data.session_key, payload.data.item);
          break;
        case "IssueStatusChanged":
          updateTicketStatus(payload.data.issue_id, payload.data.status);
          break;
        case "IssuesChanged":
          if (selectedSprintId && payload.data.project_id === selectedSprintId) {
            loadTickets(selectedSprintId);
          }
          break;
        case "SessionStatus":
          console.log(`[session:${payload.data.status}]`, payload.data.session_key, payload.data.error ?? "");
          if (payload.data.error) {
            pushFeedItem(payload.data.session_key, {
              feed_type: "system_message",
              data: `Session error: ${payload.data.error}`,
            });
          }
          break;
        case "Toast":
          console.log(`[toast:${payload.data.variant}]`, payload.data.message);
          break;
        case "CompletionToast":
          console.log("[done]", payload.data.title);
          break;
        default:
          break;
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [pushFeedItem, updateTicketStatus, selectedSprintId, loadTickets, loadSprints]);
}
