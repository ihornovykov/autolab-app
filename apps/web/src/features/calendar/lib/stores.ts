import { create } from "zustand";

import { type CalendarView } from "@/features/calendar/lib/types";

type CalendarState = {
  view: CalendarView;
  currentDate: Date;
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  view: "week",
  currentDate: new Date(),
  setView: (view) => set({ view }),
  setCurrentDate: (date) => set({ currentDate: date }),
}));
