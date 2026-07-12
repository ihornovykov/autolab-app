import dayjs, { type Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import minMax from "dayjs/plugin/minMax";

dayjs.extend(isoWeek);
dayjs.extend(minMax);

export type WorkingHoursEntry = {
  weekday: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

export type BookingTimeSegment = {
  id: string;
  bookingId: string;
  startTime: Date;
  endTime: Date;
};

const DEFAULT_OPEN = "09:00";
const DEFAULT_CLOSE = "18:00";

export const DEFAULT_WORKING_HOURS: WorkingHoursEntry[] = [
  { weekday: 1, openTime: DEFAULT_OPEN, closeTime: DEFAULT_CLOSE, isClosed: false },
  { weekday: 2, openTime: DEFAULT_OPEN, closeTime: DEFAULT_CLOSE, isClosed: false },
  { weekday: 3, openTime: DEFAULT_OPEN, closeTime: DEFAULT_CLOSE, isClosed: false },
  { weekday: 4, openTime: DEFAULT_OPEN, closeTime: DEFAULT_CLOSE, isClosed: false },
  { weekday: 5, openTime: DEFAULT_OPEN, closeTime: DEFAULT_CLOSE, isClosed: false },
  { weekday: 6, openTime: null, closeTime: null, isClosed: true },
  { weekday: 7, openTime: null, closeTime: null, isClosed: true },
];

const normalizeTime = (time: string) => time.slice(0, 5);

const parseTimeOnDate = (date: Dayjs, time: string) => {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);
  return date
    .hour(hours ?? 0)
    .minute(minutes ?? 0)
    .second(0)
    .millisecond(0);
};

const toScheduleMap = (schedule: WorkingHoursEntry[]) => {
  const map = new Map<number, WorkingHoursEntry>();
  for (const day of schedule) map.set(day.weekday, day);
  for (const fallback of DEFAULT_WORKING_HOURS) {
    if (!map.has(fallback.weekday)) map.set(fallback.weekday, fallback);
  }
  return map;
};

const getDayConfig = (cursor: Dayjs, schedule: Map<number, WorkingHoursEntry>) =>
  schedule.get(cursor.isoWeekday()) ?? DEFAULT_WORKING_HOURS[0]!;

export const getCloseTimeOnDate = (date: Date, schedule: WorkingHoursEntry[]): Date | null => {
  const scheduleMap = toScheduleMap(schedule);
  const config = getDayConfig(dayjs(date), scheduleMap);

  if (config.isClosed || !config.closeTime) return null;

  return parseTimeOnDate(dayjs(date).startOf("day"), config.closeTime).toDate();
};

export const getOpenTimeOnDate = (date: Date, schedule: WorkingHoursEntry[]): Date | null => {
  const scheduleMap = toScheduleMap(schedule);
  const config = getDayConfig(dayjs(date), scheduleMap);

  if (config.isClosed || !config.openTime) return null;

  return parseTimeOnDate(dayjs(date).startOf("day"), config.openTime).toDate();
};

export const isSameCalendarDay = (startTime: Date, endTime: Date) =>
  dayjs(startTime).isSame(dayjs(endTime), "day");

export const exceedsSameDayClose = (
  startTime: Date,
  endTime: Date,
  schedule: WorkingHoursEntry[],
) => {
  if (!isSameCalendarDay(startTime, endTime)) return false;

  const close = getCloseTimeOnDate(startTime, schedule);
  if (!close) return false;

  return dayjs(endTime).isAfter(dayjs(close));
};

export const hasAfterHoursPortions = (
  startTime: Date,
  endTime: Date,
  schedule: WorkingHoursEntry[],
) => {
  const rangeStart = dayjs(startTime);
  const rangeEnd = dayjs(endTime);

  if (!rangeEnd.isAfter(rangeStart)) return false;

  const scheduleMap = toScheduleMap(schedule);
  const startConfig = getDayConfig(rangeStart, scheduleMap);
  const endConfig = getDayConfig(rangeEnd, scheduleMap);

  if (startConfig.isClosed || !startConfig.openTime || !startConfig.closeTime) return true;
  if (endConfig.isClosed || !endConfig.openTime || !endConfig.closeTime) return true;

  const startOpen = parseTimeOnDate(rangeStart.startOf("day"), startConfig.openTime);
  const startClose = parseTimeOnDate(rangeStart.startOf("day"), startConfig.closeTime);
  const endOpen = parseTimeOnDate(rangeEnd.startOf("day"), endConfig.openTime);
  const endClose = parseTimeOnDate(rangeEnd.startOf("day"), endConfig.closeTime);

  if (rangeStart.isBefore(startOpen) || rangeStart.isAfter(startClose)) return true;
  if (rangeEnd.isBefore(endOpen) || rangeEnd.isAfter(endClose)) return true;

  return false;
};

export const splitByCalendarDayBoundaries = (
  bookingId: string,
  startTime: Date,
  endTime: Date,
): BookingTimeSegment[] => {
  const rangeEnd = dayjs(endTime);
  let cursor = dayjs(startTime);
  const segments: BookingTimeSegment[] = [];
  let index = 0;

  while (cursor.isBefore(rangeEnd)) {
    const segmentEnd = dayjs.min(cursor.endOf("day"), rangeEnd)!;

    segments.push({
      id: `${bookingId}-${index}`,
      bookingId,
      startTime: cursor.toDate(),
      endTime: segmentEnd.toDate(),
    });

    index += 1;
    cursor = segmentEnd.add(1, "millisecond");
  }

  return segments;
};

const spillAfterHoursToNextWorkingDay = (
  bookingId: string,
  startTime: Date,
  endTime: Date,
  schedule: WorkingHoursEntry[],
) => {
  const scheduleMap = toScheduleMap(schedule);
  const durationMinutes = Math.max(dayjs(endTime).diff(dayjs(startTime), "minute"), 0);
  if (durationMinutes <= 0) return [];

  const nextOpen = findNextOpenStart(dayjs(startTime), scheduleMap);
  return splitBookingByDuration(bookingId, nextOpen.toDate(), durationMinutes, schedule);
};

const findNextOpenStart = (cursor: Dayjs, schedule: Map<number, WorkingHoursEntry>) => {
  let probe = cursor.startOf("day");
  const todayConfig = getDayConfig(cursor, schedule);

  if (!todayConfig.isClosed && todayConfig.closeTime) {
    const close = parseTimeOnDate(cursor.startOf("day"), todayConfig.closeTime);
    if (!cursor.isBefore(close)) probe = probe.add(1, "day");
  }

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const config = getDayConfig(probe, schedule);
    if (!config.isClosed && config.openTime) return parseTimeOnDate(probe, config.openTime);
    probe = probe.add(1, "day");
  }

  return cursor;
};

export const computeBookingEndTime = (
  startTime: Date,
  durationMinutes: number,
  schedule: WorkingHoursEntry[],
): Date => {
  if (durationMinutes <= 0) return startTime;

  const scheduleMap = toScheduleMap(schedule);
  let cursor = dayjs(startTime);
  let remaining = durationMinutes;

  for (let safety = 0; remaining > 0 && safety < 366; safety += 1) {
    const config = getDayConfig(cursor, scheduleMap);

    if (config.isClosed || !config.openTime || !config.closeTime) {
      cursor = findNextOpenStart(cursor.add(1, "day").startOf("day"), scheduleMap);
      continue;
    }

    const open = parseTimeOnDate(cursor.startOf("day"), config.openTime);
    const close = parseTimeOnDate(cursor.startOf("day"), config.closeTime);

    if (cursor.isBefore(open)) cursor = open;
    if (!cursor.isBefore(close)) {
      cursor = findNextOpenStart(cursor.add(1, "day").startOf("day"), scheduleMap);
      continue;
    }

    const available = close.diff(cursor, "minute");
    const consumed = Math.min(available, remaining);
    cursor = cursor.add(consumed, "minute");
    remaining -= consumed;
  }

  return cursor.toDate();
};

export const splitBookingByDuration = (
  bookingId: string,
  startTime: Date,
  durationMinutes: number,
  schedule: WorkingHoursEntry[],
): BookingTimeSegment[] => {
  if (durationMinutes <= 0) return [];

  const scheduleMap = toScheduleMap(schedule);
  const segments: BookingTimeSegment[] = [];
  let cursor = dayjs(startTime);
  let remaining = durationMinutes;
  let index = 0;

  for (let safety = 0; remaining > 0 && safety < 366; safety += 1) {
    const config = getDayConfig(cursor, scheduleMap);

    if (config.isClosed || !config.openTime || !config.closeTime) {
      cursor = findNextOpenStart(cursor.add(1, "day").startOf("day"), scheduleMap);
      continue;
    }

    const open = parseTimeOnDate(cursor.startOf("day"), config.openTime);
    const close = parseTimeOnDate(cursor.startOf("day"), config.closeTime);

    if (cursor.isBefore(open)) cursor = open;
    if (!cursor.isBefore(close)) {
      cursor = findNextOpenStart(cursor.add(1, "day").startOf("day"), scheduleMap);
      continue;
    }

    const available = close.diff(cursor, "minute");
    const consumed = Math.min(available, remaining);
    const segmentEnd = cursor.add(consumed, "minute");

    segments.push({
      id: `${bookingId}-${index}`,
      bookingId,
      startTime: cursor.toDate(),
      endTime: segmentEnd.toDate(),
    });

    index += 1;
    remaining -= consumed;

    if (remaining > 0) {
      cursor = findNextOpenStart(segmentEnd.startOf("day").add(1, "day"), scheduleMap);
    }
  }

  return segments;
};

export const splitBookingByTimeRange = (
  bookingId: string,
  startTime: Date,
  endTime: Date,
  schedule: WorkingHoursEntry[],
): BookingTimeSegment[] => {
  const rangeEnd = dayjs(endTime);
  const rangeStart = dayjs(startTime);

  if (!rangeEnd.isAfter(rangeStart)) return [];

  const scheduleMap = toScheduleMap(schedule);
  const segments: BookingTimeSegment[] = [];
  let cursor = rangeStart;
  let index = 0;

  for (let safety = 0; cursor.isBefore(rangeEnd) && safety < 366; safety += 1) {
    const config = getDayConfig(cursor, scheduleMap);

    if (config.isClosed || !config.openTime || !config.closeTime) {
      cursor = findNextOpenStart(cursor.startOf("day").add(1, "day"), scheduleMap);
      continue;
    }

    const open = parseTimeOnDate(cursor.startOf("day"), config.openTime);
    const close = parseTimeOnDate(cursor.startOf("day"), config.closeTime);

    if (cursor.isBefore(open)) cursor = open;
    if (!cursor.isBefore(close)) {
      cursor = findNextOpenStart(cursor.startOf("day").add(1, "day"), scheduleMap);
      continue;
    }

    const segmentEnd = dayjs.min(close, rangeEnd)!;
    if (!cursor.isBefore(segmentEnd)) {
      cursor = findNextOpenStart(cursor.startOf("day").add(1, "day"), scheduleMap);
      continue;
    }

    segments.push({
      id: `${bookingId}-${index}`,
      bookingId,
      startTime: cursor.toDate(),
      endTime: segmentEnd.toDate(),
    });

    index += 1;
    if (!segmentEnd.isBefore(rangeEnd)) break;

    cursor = findNextOpenStart(segmentEnd.startOf("day").add(1, "day"), scheduleMap);
  }

  return segments;
};

export const splitSameDayWithOverflow = (
  bookingId: string,
  startTime: Date,
  endTime: Date,
  schedule: WorkingHoursEntry[],
): BookingTimeSegment[] => {
  const scheduleMap = toScheduleMap(schedule);
  const end = dayjs(endTime);
  const close = getCloseTimeOnDate(startTime, schedule);

  if (!close || !end.isAfter(dayjs(close))) {
    return splitBookingByTimeRange(bookingId, startTime, endTime, schedule);
  }

  const segments: BookingTimeSegment[] = [];
  let index = 0;

  const daySegments = splitBookingByTimeRange(bookingId, startTime, close, schedule);
  for (const segment of daySegments) {
    segments.push({ ...segment, id: `${bookingId}-${index}` });
    index += 1;
  }

  const overflowMinutes = end.diff(dayjs(close), "minute");
  if (overflowMinutes > 0) {
    const nextOpen = findNextOpenStart(dayjs(close).startOf("day").add(1, "day"), scheduleMap);
    const overflowSegments = splitBookingByDuration(
      bookingId,
      nextOpen.toDate(),
      overflowMinutes,
      schedule,
    );

    for (const segment of overflowSegments) {
      segments.push({ ...segment, id: `${bookingId}-${index}` });
      index += 1;
    }
  }

  return segments;
};

export const splitBookingIntoSegments = (
  bookingId: string,
  startTime: Date,
  endTime: Date,
  schedule: WorkingHoursEntry[],
): BookingTimeSegment[] => splitBookingByTimeRange(bookingId, startTime, endTime, schedule);

export const getWorkingHoursGridBounds = (schedule: WorkingHoursEntry[]) => {
  const openDays = schedule.filter((day) => !day.isClosed && day.openTime && day.closeTime);
  if (!openDays.length) return { startHour: 8, endHour: 19 };

  const toHour = (time: string) => {
    const [hours, minutes] = normalizeTime(time).split(":").map(Number);
    return (hours ?? 0) + (minutes ?? 0) / 60;
  };

  const opens = openDays.map((day) => toHour(day.openTime!));
  const closes = openDays.map((day) => toHour(day.closeTime!));

  return {
    startHour: Math.floor(Math.min(...opens)),
    endHour: Math.ceil(Math.max(...closes)),
  };
};

export const mapDbWorkingHours = (
  rows: Array<{
    weekday: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>,
): WorkingHoursEntry[] =>
  rows.map((row) => ({
    weekday: row.weekday,
    openTime: row.openTime ? normalizeTime(row.openTime) : null,
    closeTime: row.closeTime ? normalizeTime(row.closeTime) : null,
    isClosed: row.isClosed,
  }));

export const getBookingDurationMinutes = (
  services: Array<{ duration: number }> | undefined,
  startTime: Date,
  endTime: Date,
) => {
  const fromServices = services?.reduce((sum, service) => sum + service.duration, 0) ?? 0;
  const wallClock = Math.max(dayjs(endTime).diff(dayjs(startTime), "minute"), 0);

  return Math.max(fromServices, wallClock);
};

export const resolveBookingEndTime = (
  startTime: Date,
  durationMinutes: number,
  schedule: WorkingHoursEntry[],
) => computeBookingEndTime(startTime, durationMinutes, schedule);

export const resolveCalendarSegments = (
  bookingId: string,
  startTime: Date,
  endTime: Date,
  schedule: WorkingHoursEntry[],
  allowsOvertime = false,
) => {
  if (!dayjs(endTime).isAfter(dayjs(startTime))) return [];

  if (allowsOvertime && hasAfterHoursPortions(startTime, endTime, schedule)) {
    if (isSameCalendarDay(startTime, endTime)) {
      return [
        {
          id: `${bookingId}-0`,
          bookingId,
          startTime,
          endTime,
        },
      ];
    }

    return splitByCalendarDayBoundaries(bookingId, startTime, endTime);
  }

  if (
    !allowsOvertime &&
    isSameCalendarDay(startTime, endTime) &&
    exceedsSameDayClose(startTime, endTime, schedule)
  ) {
    return splitSameDayWithOverflow(bookingId, startTime, endTime, schedule);
  }

  const segments = splitBookingByTimeRange(bookingId, startTime, endTime, schedule);
  if (segments.length) return segments;

  if (!allowsOvertime && hasAfterHoursPortions(startTime, endTime, schedule)) {
    return spillAfterHoursToNextWorkingDay(bookingId, startTime, endTime, schedule);
  }

  return allowsOvertime ? splitByCalendarDayBoundaries(bookingId, startTime, endTime) : [];
};
