import { create } from "zustand";

export type ViewMode = "board" | "events" | "memory" | "retro";

interface UIState {
  viewMode: ViewMode;
  agentName: string;
  setViewMode: (mode: ViewMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: "board",
  agentName: "gsprint",
  setViewMode: (viewMode) => set({ viewMode }),
}));
