import { create } from "zustand";

interface UIState {
  agentName: string;
}

export const useUIStore = create<UIState>(() => ({
  agentName: "gsprint",
}));
