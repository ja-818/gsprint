import { create } from "zustand";
import { tauriProjects } from "../lib/tauri";
import type { Project } from "../lib/types";
import { PLANNING_STEPS } from "../config/planning-steps";

export type SprintPhase = "planning" | "executing" | "done";

export interface Sprint {
  id: string;
  name: string;
  phase: SprintPhase;
  planningStep: string;
  completedPlanningSteps: string[];
}

function projectToSprint(p: Project): Sprint {
  return {
    id: p.id,
    name: p.name,
    phase: "planning",
    planningStep: "office-hours",
    completedPlanningSteps: [],
  };
}

interface SprintState {
  sprints: Sprint[];
  selectedSprintId: string | null;
  loading: boolean;
  loadSprints: () => Promise<void>;
  createSprint: (name: string) => Promise<void>;
  selectSprint: (id: string) => void;
  advancePlanningStep: (sprintId: string) => void;
  moveToExecution: (sprintId: string) => void;
}

export const useSprintStore = create<SprintState>((set) => ({
  sprints: [],
  selectedSprintId: null,
  loading: false,

  loadSprints: async () => {
    set({ loading: true });
    try {
      const projects = await tauriProjects.list();
      set({ sprints: projects.map(projectToSprint), loading: false });
    } catch (err) {
      console.error("Failed to load sprints:", err);
      set({ loading: false });
    }
  },

  createSprint: async (name) => {
    try {
      const project = await tauriProjects.create(name, `~/Documents/GSprint/${name}`);
      const sprint = projectToSprint(project);
      set((s) => ({
        sprints: [...s.sprints, sprint],
        selectedSprintId: sprint.id,
      }));
    } catch (err) {
      console.error("Failed to create sprint:", err);
    }
  },

  selectSprint: (id) => set({ selectedSprintId: id }),

  advancePlanningStep: (sprintId) => {
    set((s) => ({
      sprints: s.sprints.map((sprint) => {
        if (sprint.id !== sprintId) return sprint;
        const currentIdx = PLANNING_STEPS.findIndex((step) => step.id === sprint.planningStep);
        if (currentIdx < 0) return sprint;
        const completed = [...sprint.completedPlanningSteps, sprint.planningStep];
        const nextStep = PLANNING_STEPS[currentIdx + 1];
        return {
          ...sprint,
          completedPlanningSteps: completed,
          planningStep: nextStep ? nextStep.id : sprint.planningStep,
        };
      }),
    }));
  },

  moveToExecution: (sprintId) => {
    set((s) => ({
      sprints: s.sprints.map((sprint) =>
        sprint.id === sprintId ? { ...sprint, phase: "executing" as const } : sprint,
      ),
    }));
  },
}));
