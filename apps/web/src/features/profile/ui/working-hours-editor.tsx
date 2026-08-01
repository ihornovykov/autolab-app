import { Checkbox } from "@autolab/ui/components/checkbox";
import { TimePicker } from "@autolab/ui/components/time-picker";
import { cn } from "@autolab/ui/lib/utils";

import { weekdayLabels } from "@/features/profile/lib/constants";
import type { WorkingHoursDay } from "@/features/profile/lib/types";
import { toTimeInputValue } from "@/features/profile/lib/utils";

type Props = {
  days: WorkingHoursDay[];
  onChange: (days: WorkingHoursDay[]) => void;
  dayErrors?: Partial<Record<number, string>>;
  formError?: string;
};

export const WorkingHoursEditor = ({ days, onChange, dayErrors, formError }: Props) => {
  const updateDay = (weekday: number, patch: Partial<WorkingHoursDay>) => {
    onChange(days.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)));
  };

  const handleClosedChange = (weekday: number, isClosed: boolean) => {
    updateDay(weekday, {
      isClosed,
      openTime: isClosed ? null : "09:00",
      closeTime: isClosed ? null : "18:00",
    });
  };

  return (
    <div className="space-y-4">
      {formError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <div className="space-y-2">
        {days.map((day) => (
          <div
            key={day.weekday}
            className={cn(
              "grid grid-cols-1 gap-3 rounded-xl border border-border/60 p-3 sm:grid-cols-[9rem_1fr_1fr_auto]",
              day.isClosed && "bg-muted/20",
              dayErrors?.[day.weekday] && "border-destructive/50",
            )}
          >
            <p className="self-center text-sm font-medium">{weekdayLabels[day.weekday]}</p>

            <TimePicker
              label="Початок"
              value={toTimeInputValue(day.openTime)}
              disabled={day.isClosed}
              minuteStep={1}
              onChange={(nextValue) => updateDay(day.weekday, { openTime: nextValue })}
            />

            <TimePicker
              label="Кінець"
              value={toTimeInputValue(day.closeTime)}
              disabled={day.isClosed}
              minuteStep={1}
              onChange={(nextValue) => updateDay(day.weekday, { closeTime: nextValue })}
            />

            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <Checkbox
                checked={day.isClosed}
                onCheckedChange={(checked) => handleClosedChange(day.weekday, checked === true)}
              />
              Вихідний
            </label>

            {dayErrors?.[day.weekday] ? (
              <p className="text-sm text-destructive sm:col-span-4">{dayErrors[day.weekday]}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
