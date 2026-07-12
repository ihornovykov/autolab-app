import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { range } from "@/shared/lib/arrays";
import { orpc } from "@/shared/api/orpc";
import { Button } from "@autolab/ui/components/button";
import { Checkbox } from "@autolab/ui/components/checkbox";
import { Input } from "@autolab/ui/components/input";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";

type WorkingHoursDay = {
  weekday: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

const weekdayLabels: Record<number, string> = {
  1: "Понеділок",
  2: "Вівторок",
  3: "Середа",
  4: "Четвер",
  5: "П'ятниця",
  6: "Субота",
  7: "Неділя",
};

const defaultDays: WorkingHoursDay[] = [
  { weekday: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 6, openTime: null, closeTime: null, isClosed: true },
  { weekday: 7, openTime: null, closeTime: null, isClosed: true },
];

const toTimeInputValue = (value: string | null | undefined) => {
  if (!value) return "";
  return value.slice(0, 5);
};

const mapApiDays = (rows: Array<WorkingHoursDay>) =>
  defaultDays.map((fallback) => {
    const row = rows.find((item) => item.weekday === fallback.weekday);
    if (!row) return fallback;
    return {
      weekday: row.weekday,
      openTime: toTimeInputValue(row.openTime) || fallback.openTime,
      closeTime: toTimeInputValue(row.closeTime) || fallback.closeTime,
      isClosed: row.isClosed,
    };
  });

export const ProfileWorkingHoursForm = () => {
  const queryClient = useQueryClient();
  const [days, setDays] = useState<WorkingHoursDay[]>(defaultDays);

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
      setDays(mapApiDays(workingHoursQuery.data));
    }
  }, [workingHoursQuery.data]);

  const updateDay = (weekday: number, patch: Partial<WorkingHoursDay>) => {
    setDays((current) =>
      current.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)),
    );
  };

  const handleClosedChange = (weekday: number, isClosed: boolean) => {
    updateDay(weekday, {
      isClosed,
      openTime: isClosed ? null : "09:00",
      closeTime: isClosed ? null : "18:00",
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateMutation.mutate({
      days: days.map((day) => ({
        weekday: day.weekday,
        isClosed: day.isClosed,
        openTime: day.isClosed ? null : day.openTime,
        closeTime: day.isClosed ? null : day.closeTime,
      })),
    });
  };

  if (workingHoursQuery.isLoading) {
    return <ProfileWorkingHoursFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Графік роботи</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Вкажіть години, коли ви доступні для записів. Робота поза цим часом переноситься на
          наступний робочий день.
        </p>
      </div>

      <div className="space-y-2">
        {days.map((day) => (
          <div
            key={day.weekday}
            className={cn(
              "grid grid-cols-1 gap-3 rounded-xl border border-border/60 p-3 sm:grid-cols-[9rem_1fr_1fr_auto]",
              day.isClosed && "bg-muted/20",
            )}
          >
            <p className="self-center text-sm font-medium">{weekdayLabels[day.weekday]}</p>

            <Input
              label="Початок"
              type="time"
              value={toTimeInputValue(day.openTime)}
              disabled={day.isClosed}
              onChange={(event) => updateDay(day.weekday, { openTime: event.target.value })}
            />

            <Input
              label="Кінець"
              type="time"
              value={toTimeInputValue(day.closeTime)}
              disabled={day.isClosed}
              onChange={(event) => updateDay(day.weekday, { closeTime: event.target.value })}
            />

            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <Checkbox
                checked={day.isClosed}
                onCheckedChange={(checked) =>
                  handleClosedChange(day.weekday, checked === true)
                }
              />
              Вихідний
            </label>
          </div>
        ))}
      </div>

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
