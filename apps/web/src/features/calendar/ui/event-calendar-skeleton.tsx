import {
  EndHour,
  EventGap,
  EventHeight,
  StartHour,
  WeekCellsHeight,
} from "@/features/calendar/lib/constants";
import { type CalendarView } from "@/features/calendar/lib/types";
import { range } from "@/shared/lib/arrays";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";

type TimedSkeletonEvent = {
  startHour: number;
  durationHours: number;
  width?: string;
};

const MONTH_EVENT_WIDTHS: string[][] = [
  [],
  ["w-[72%]"],
  ["w-full", "w-[48%]"],
  ["w-[64%]"],
  ["w-[88%]", "w-[56%]"],
  [],
  ["w-[76%]"],
  ["w-full", "w-[62%]", "w-[40%]"],
  ["w-[54%]"],
  [],
  ["w-[82%]"],
  ["w-[68%]", "w-full"],
  [],
  ["w-[58%]"],
  ["w-full", "w-[44%]"],
];

const WEEK_SKELETON_EVENTS: TimedSkeletonEvent[][] = [
  [
    { startHour: 9, durationHours: 1.5, width: "w-[92%]" },
    { startHour: 14.5, durationHours: 1, width: "w-[78%]" },
  ],
  [{ startHour: 10, durationHours: 2.25, width: "w-full" }],
  [],
  [
    { startHour: 8.5, durationHours: 0.75, width: "w-[65%]" },
    { startHour: 13, durationHours: 1.5, width: "w-[88%]" },
  ],
  [{ startHour: 11, durationHours: 1, width: "w-[70%]" }],
  [
    { startHour: 9.25, durationHours: 2, width: "w-full" },
    { startHour: 16, durationHours: 0.5, width: "w-[55%]" },
  ],
  [{ startHour: 12, durationHours: 1.75, width: "w-[84%]" }],
  [],
];

const DAY_SKELETON_EVENTS: TimedSkeletonEvent[] = [
  { startHour: 8.5, durationHours: 1, width: "w-[68%]" },
  { startHour: 10.75, durationHours: 2.5, width: "w-full" },
  { startHour: 15, durationHours: 0.75, width: "w-[52%]" },
  { startHour: 17.5, durationHours: 1.25, width: "w-[76%]" },
];

const toTimedStyle = (event: TimedSkeletonEvent) => ({
  top: `${(event.startHour - StartHour) * WeekCellsHeight}px`,
  height: `${Math.max(event.durationHours * WeekCellsHeight - EventGap, EventHeight)}px`,
});

const MonthViewSkeleton = () => (
  <div className="flex h-full flex-col">
    <div className="grid grid-cols-7 border-b border-border/70">
      {range(7).map((index) => (
        <div key={index} className="py-2 text-center">
          <Skeleton className="mx-auto h-3.5 w-8" />
        </div>
      ))}
    </div>
    <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7">
      {range(35).map((index) => {
        const eventWidths = MONTH_EVENT_WIDTHS[index % MONTH_EVENT_WIDTHS.length] ?? [];

        return (
          <div
            key={index}
            className={cn(
              "flex min-h-24 flex-col border-r border-b border-border/70 p-1.5 last:border-r-0",
              index % 7 === 6 && "border-r-0",
            )}
          >
            <Skeleton className="mb-2 size-6 shrink-0 rounded-full" />
            <div
              className="flex flex-col"
              style={{ gap: `${EventGap}px` }}
            >
              {eventWidths.map((width, eventIndex) => (
                <Skeleton
                  key={eventIndex}
                  className={cn("shrink-0 rounded-sm", width)}
                  style={{ height: `${EventHeight}px` }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const TimedGridSkeleton = ({
  dayCount,
  eventsByDay,
}: {
  dayCount: number;
  eventsByDay: TimedSkeletonEvent[][];
}) => {
  const hours = range(EndHour - StartHour);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "grid shrink-0 border-b border-border/70 bg-background/80",
          dayCount === 1
            ? "grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]"
            : "grid-cols-[auto_repeat(7,minmax(0,1fr))]",
        )}
      >
        <div className={dayCount === 1 ? "w-12 sm:w-16" : "w-12"} />
        {range(dayCount).map((index) => (
          <div key={index} className="flex items-center justify-center gap-1.5 py-2">
            <Skeleton className="size-7 rounded-sm" />
            {dayCount > 1 ? <Skeleton className="hidden h-3.5 w-10 sm:block" /> : null}
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "grid h-full",
            dayCount === 1
              ? "grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]"
              : "grid-cols-[auto_repeat(7,minmax(0,1fr))]",
          )}
        >
          <div className="border-r border-border/70">
            {hours.map((index) => (
              <div
                key={index}
                className="relative border-b border-border/70 last:border-b-0"
                style={{ height: `${WeekCellsHeight}px` }}
              >
                {index % 2 === 0 ? (
                  <Skeleton className="absolute -top-2 right-1 h-3 w-8 sm:right-2" />
                ) : null}
              </div>
            ))}
          </div>

          {range(dayCount).map((dayIndex) => (
            <div
              key={dayIndex}
              className="relative border-r border-border/70 last:border-r-0"
            >
              {hours.map((hourIndex) => (
                <div
                  key={hourIndex}
                  className="border-b border-border/70 last:border-b-0"
                  style={{ height: `${WeekCellsHeight}px` }}
                />
              ))}

              {(eventsByDay[dayIndex] ?? []).map((event, eventIndex) => (
                <Skeleton
                  key={eventIndex}
                  className={cn(
                    "absolute left-0.5 rounded-md",
                    event.width ?? "w-[88%]",
                  )}
                  style={toTimedStyle(event)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WeekViewSkeleton = () => (
  <TimedGridSkeleton dayCount={7} eventsByDay={WEEK_SKELETON_EVENTS} />
);

const DayViewSkeleton = () => (
  <TimedGridSkeleton dayCount={1} eventsByDay={[DAY_SKELETON_EVENTS]} />
);

type Props = {
  view: CalendarView;
};

export const EventCalendarViewSkeleton = ({ view }: Props) => {
  if (view === "week") return <WeekViewSkeleton />;
  if (view === "day") return <DayViewSkeleton />;
  return <MonthViewSkeleton />;
};
