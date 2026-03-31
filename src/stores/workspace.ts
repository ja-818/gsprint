import { create } from "zustand";
import { tauriProjects } from "../lib/tauri";
import type { Project } from "../lib/types";

interface WorkspaceState {
  workspace: Project | null;
  ready: boolean;
  init: () => Promise<void>;
}

const WORKSPACE_NAME = "gsprint";
const WORKSPACE_FOLDER = "~";

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  ready: false,
  init: async () => {
    try {
      const projects = await tauriProjects.list();
      let ws = projects.find((p) => p.name === WORKSPACE_NAME) ?? null;
      if (!ws) {
        ws = await tauriProjects.create(WORKSPACE_NAME, WORKSPACE_FOLDER);
      }
      set({ workspace: ws, ready: true });
    } catch (err) {
      console.error("Failed to init workspace:", err);
      set({ ready: true });
    }
  },
}));
