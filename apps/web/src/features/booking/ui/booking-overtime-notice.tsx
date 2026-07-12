import dayjs from "dayjs";
import { useMemo } from "react";

import {
  DEFAULT_WORKING_HOURS,
  hasAfterHoursPortions,
  resolveCalendarSegments,
  type WorkingHoursEntry,
} from "@autolab/api/lib/working-hours";
import { Checkbox } from "@autolab/ui/components/checkbox";
import { Label } from "@autolab/ui/components/label";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  startTime: string;
  endTime: string;
  schedule: WorkingHoursEntry[];
  allowsOvertime: boolean;
  onAllowsOvertimeChange: (value: boolean) => void;
};

const formatSegmentRange = (start: Date, end: Date) => {
  const startLabel = dayjs(start).locale("uk").format("D MMM, HH:mm");
  const endLabel = dayjs(end).format("HH:mm");
  return `${startLabel} – ${endLabel}`;
};

export const BookingOvertimeNotice = ({
  startTime,
  endTime,
  schedule,
  allowsOvertime,
  onAllowsOvertimeChange,
}: Props) => {
  const start = useMemo(() => new Date(startTime), [startTime]);
  const end = useMemo(() => new Date(endTime), [endTime]);
  const effectiveSchedule = schedule.length ? schedule : DEFAULT_WORKING_HOURS;

  const showNotice = useMemo(
    () => hasAfterHoursPortions(start, end, effectiveSchedule),
    [start, end, effectiveSchedule],
  );

  const previewSegments = useMemo(() => {
    if (!showNotice || allowsOvertime) return [];

    return resolveCalendarSegments("preview", start, end, effectiveSchedule, false);
  }, [allowsOvertime, end, showNotice, start, effectiveSchedule]);

  if (!showNotice) return null;

  return (
    <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id="booking-allows-overtime"
          checked={allowsOvertime}
          onCheckedChange={(checked) => onAllowsOvertimeChange(checked === true)}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label htmlFor="booking-allows-overtime" className="text-sm font-medium">
            Працювати понаднормово
          </Label>
          <p className="text-xs text-muted-foreground">
            Залишити запис у вказаний час, включно з годинами поза робочим графіком
          </p>
        </div>
      </div>

      {!allowsOvertime ? (
        <div
          className={cn(
            "rounded-lg border border-amber-500/20 bg-background/80 px-3 py-2 text-xs text-amber-900 dark:text-amber-100",
          )}
        >
          <p>Час поза робочим графіком буде перенесено на наступні робочі години.</p>
          {previewSegments.length ? (
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {previewSegments.map((segment) => (
                <li key={segment.id}>• {formatSegmentRange(segment.startTime, segment.endTime)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
