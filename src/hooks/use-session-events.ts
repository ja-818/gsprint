import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useFeedStore } from "../stores/feeds";
import { useIssueStore } from "../stores/issues";
import { useWorkspaceStore } from "../stores/workspace";
import { useEventStore } from "../stores/events";
import { useMemoryStore } from "../stores/memory";
import type { KeelEvent } from "../lib/types";
import type { EventEntry, EventType, EventSource } from "@deck-ui/events";

export function useSessionEvents() {
  const pushFeedItem = useFeedStore((s) => s.pushFeedItem);
  const updateIssueStatus = useIssueStore((s) => s.updateIssueStatus);
  const workspace = useWorkspaceStore((s) => s.workspace);
  const loadIssues = useIssueStore((s) => s.loadIssues);
  const pushEvent = useEventStore((s) => s.pushEvent);
  const updateEventStatus = useEventStore((s) => s.updateEventStatus);
  const loadMemories = useMemoryStore((s) => s.loadMemories);
  const deleteMemory = useMemoryStore((s) => s.deleteMemory);

  useEffect(() => {
    const unlisten = listen<KeelEvent>("keel-event", (event) => {
      const payload = event.payload;

      switch (payload.type) {
        case "FeedItem":
          pushFeedItem(payload.data.session_key, payload.data.item);
          break;
        case "IssueStatusChanged":
          updateIssueStatus(payload.data.issue_id, payload.data.status);
          break;
        case "IssuesChanged":
          if (workspace && payload.data.project_id === workspace.id) {
            loadIssues(workspace.id);
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
        case "AuthRequired":
          console.warn("[auth]", payload.data.message);
          break;
        case "CompletionToast":
          console.log("[done]", payload.data.title);
          break;
        case "EventReceived":
          pushEvent(toEventEntry(payload.data));
          break;
        case "EventProcessed":
          updateEventStatus(payload.data.event_id, payload.data.status);
          break;
        case "HeartbeatFired":
          pushEvent(makeSchedulerEvent("heartbeat", payload.data.prompt));
          break;
        case "CronFired":
          pushEvent(makeSchedulerEvent("cron", payload.data.prompt, payload.data.job_name));
          break;
        case "ChannelMessageReceived":
          pushEvent(makeChannelEvent(payload.data));
          break;
        case "ChannelStatusChanged":
          console.log("[channel]", payload.data.channel_type, payload.data.status);
          break;
        case "MemoryChanged":
          if (workspace && payload.data.project_id === workspace.id) {
            loadMemories(workspace.id);
          }
          break;
        case "MemoryDeleted":
          deleteMemory(payload.data.memory_id);
          break;
        case "RoutineRunChanged":
          console.log("[routine-run]", payload.data.routine_id, payload.data.status);
          break;
        case "RoutinesChanged":
          console.log("[routines]", payload.data.project_id);
          break;
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [pushFeedItem, updateIssueStatus, workspace, loadIssues, pushEvent, updateEventStatus, loadMemories, deleteMemory]);
}

function toEventEntry(data: {
  event_id: string;
  event_type: string;
  source_channel: string;
  source_identifier: string;
  summary: string;
}): EventEntry {
  return {
    id: data.event_id,
    type: data.event_type as EventType,
    source: { channel: data.source_channel, identifier: data.source_identifier } as EventSource,
    summary: data.summary,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

function makeSchedulerEvent(eventType: EventType, prompt: string, identifier = "scheduler"): EventEntry {
  return {
    id: crypto.randomUUID(),
    type: eventType,
    source: { channel: "system", identifier },
    summary: prompt,
    status: "completed",
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  };
}

function makeChannelEvent(data: { channel_type: string; channel_id: string; sender_name: string; text: string }): EventEntry {
  return {
    id: crypto.randomUUID(),
    type: "message",
    source: { channel: data.channel_type, identifier: data.channel_id },
    summary: `${data.sender_name}: ${data.text}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}
