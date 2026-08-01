import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { defaultWorkingHoursDays } from "@/features/profile/lib/constants";
import type { WorkingHoursDay } from "@/features/profile/lib/types";
import {
  mapApiWorkingHoursDays,
  toWorkingHoursMutationInput,
} from "@/features/profile/lib/utils";
import { workingHoursDaysSchema } from "@/features/profile/lib/validation";
import { WorkingHoursEditor } from "@/features/profile/ui/working-hours-editor";
import { orpc } from "@/shared/api/orpc";
import { Button } from "@autolab/ui/components/button";

type Props = {
  initialDays?: WorkingHoursDay[];
  onCompleted: () => void;
  onBack?: () => void;
};

export const OnboardingWorkingHoursForm = ({ initialDays, onCompleted, onBack }: Props) => {
  const queryClient = useQueryClient();
  const [days, setDays] = useState<WorkingHoursDay[]>(initialDays ?? defaultWorkingHoursDays);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (initialDays?.length) {
      setDays(mapApiWorkingHoursDays(initialDays));
    }
  }, [initialDays]);

  const updateMutation = useMutation(
    orpc.profile.updateMyWorkingHours.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.profile.key() });
        toast.success("Графік роботи збережено");
        onCompleted();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося зберегти графік роботи");
      },
    }),
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);

    const result = workingHoursDaysSchema.safeParse(days);
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Перевірте графік роботи");
      return;
    }

    setFormError(null);
    updateMutation.mutate({
      days: toWorkingHoursMutationInput(result.data),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WorkingHoursEditor days={days} onChange={setDays} formError={hasAttemptedSubmit ? formError ?? undefined : undefined} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            Назад
          </Button>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className={onBack ? "sm:min-w-40" : "w-full"}
          loading={updateMutation.isPending}
          icon={<ArrowRight className="size-4" />}
        >
          Продовжити
        </Button>
      </div>
    </form>
  );
};
