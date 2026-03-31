import { Stepper } from "@deck-ui/core";
import { ChatPanel } from "@deck-ui/chat";
import { PLANNING_STEPS } from "../config/planning-steps";
import { useFeedStore } from "../stores/feeds";
import type { Sprint } from "../stores/sprints";

interface PlanningViewProps {
  sprint: Sprint;
}

export function PlanningView({ sprint }: PlanningViewProps) {
  const feedItems = useFeedStore((s) => s.items);
  const sessionKey = `sprint-${sprint.id}-planning`;
  const currentStep = PLANNING_STEPS.find((s) => s.id === sprint.planningStep);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Stepper at top */}
      <div className="shrink-0 px-6 py-4 border-b border-border">
        <Stepper
          steps={PLANNING_STEPS.map((s) => ({ id: s.id, label: s.label }))}
          activeStep={sprint.planningStep}
          completedSteps={sprint.completedPlanningSteps}
        />
      </div>
      {/* Chat below */}
      <div className="flex-1 min-h-0">
        <ChatPanel
          sessionKey={sessionKey}
          feedItems={feedItems[sessionKey] ?? []}
          isLoading={false}
          onSend={() => {}}
          placeholder={`Running ${currentStep?.gstackCommand ?? "planning"}...`}
        />
      </div>
    </div>
  );
}
