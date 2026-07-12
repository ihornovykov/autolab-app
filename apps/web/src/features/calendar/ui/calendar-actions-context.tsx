import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type CalendarActionsContextValue = {
  onEventClick: (eventId: string) => void;
  onSlotClick: (date: Date, time?: number) => void;
  hoveredBookingId: string | null;
  setHoveredBookingId: (bookingId: string | null) => void;
};

const CalendarActionsContext = createContext<CalendarActionsContextValue | null>(null);

type Props = {
  children: ReactNode;
  onEventClick: (eventId: string) => void;
  onSlotClick: (date: Date, time?: number) => void;
};

export const CalendarActionsProvider = ({ children, onEventClick, onSlotClick }: Props) => {
  const [hoveredBookingId, setHoveredBookingIdState] = useState<string | null>(null);
  const clearHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setHoveredBookingId = useCallback((bookingId: string | null) => {
    if (clearHoverTimeoutRef.current) {
      clearTimeout(clearHoverTimeoutRef.current);
      clearHoverTimeoutRef.current = null;
    }

    if (bookingId) {
      setHoveredBookingIdState(bookingId);
      return;
    }

    clearHoverTimeoutRef.current = setTimeout(() => {
      setHoveredBookingIdState(null);
      clearHoverTimeoutRef.current = null;
    }, 80);
  }, []);

  return (
    <CalendarActionsContext.Provider
      value={{ onEventClick, onSlotClick, hoveredBookingId, setHoveredBookingId }}
    >
      {children}
    </CalendarActionsContext.Provider>
  );
};

export const useCalendarActions = () => {
  const context = useContext(CalendarActionsContext);
  if (!context) {
    throw new Error("useCalendarActions must be used within CalendarActionsProvider");
  }
  return context;
};
