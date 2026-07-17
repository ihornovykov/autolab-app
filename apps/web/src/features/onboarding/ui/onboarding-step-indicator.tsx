import { cn } from "@autolab/ui/lib/utils";
import { CheckIcon } from "lucide-react";

export type OnboardingStep = "profile" | "working-hours" | "organization";

type Props = {
  currentStep: OnboardingStep;
};

const steps = [
  { id: "profile" as const, label: "Профіль" },
  { id: "working-hours" as const, label: "Графік" },
  { id: "organization" as const, label: "Організація" },
];

export const OnboardingStepIndicator = ({ currentStep }: Props) => {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <ol className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <li key={step.id} className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-sm font-medium",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-border text-muted-foreground",
                )}
              >
                {isCompleted ? <CheckIcon className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="hidden h-px w-8 bg-border sm:block" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};
