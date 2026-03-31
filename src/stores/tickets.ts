import { create } from "zustand";
import { tauriIssues } from "../lib/tauri";
import type { Issue } from "../lib/types";

interface TicketState {
  tickets: Issue[];
  loading: boolean;
  loadTickets: (projectId: string) => Promise<void>;
  createTicket: (projectId: string, title: string, description: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: string) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  loading: false,

  loadTickets: async (projectId) => {
    set({ loading: true });
    const tickets = await tauriIssues.list(projectId);
    set({ tickets, loading: false });
  },

  createTicket: async (projectId, title, description) => {
    const ticket = await tauriIssues.create(projectId, title, description);
    set((s) => ({ tickets: [...s.tickets, ticket] }));
  },

  updateTicketStatus: (ticketId, status) => {
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === ticketId ? { ...t, status } : t,
      ),
    }));
  },
}));
