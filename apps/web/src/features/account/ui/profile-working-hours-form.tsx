import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { range } from "@/shared/lib/arrays";
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
import { Skeleton } from "@autolab/ui/components/skeleton";

export const ProfileWorkingHoursForm = () => {
  const queryClient = useQueryClient();
  const [days, setDays] = useState<WorkingHoursDay[]>(defaultWorkingHoursDays);
  const [formError, setFormError] = useState<string | null>(null);

  const workingHoursQuery = useQuery(orpc.profile.getMyWorkingHours.queryOptions());

  const updateMutation = useMutation(
    orpc.profile.updateMyWorkingHours.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.profile.key() });
        toast.success("Графік роботи збережено");
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося зберегти графік роботи");
      },
    }),
  );

  useEffect(() => {
    if (workingHoursQuery.data?.length) {
      setDays(mapApiWorkingHoursDays(workingHoursQuery.data));
    }
  }, [workingHoursQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

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

  if (workingHoursQuery.isLoading) {
    return <ProfileWorkingHoursFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <WorkingHoursEditor days={days} onChange={setDays} formError={formError ?? undefined} />

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" loading={updateMutation.isPending}>
          Зберегти графік
        </Button>
      </div>
    </form>
  );
};

export const ProfileWorkingHoursFormSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
    <div className="space-y-3">
      {range(7).map((index) => (
        <Skeleton key={index} className="h-14 w-full rounded-lg" />
      ))}
    </div>
    <div className="flex justify-end border-t border-border pt-4">
      <Skeleton className="h-9 w-36" />
    </div>
  </div>
);
