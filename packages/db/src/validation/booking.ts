import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { bookings } from "../schema/booking";

export const bookingSelectSchema = createSelectSchema(bookings);
export const bookingInsertSchema = createInsertSchema(bookings);

export const bookingOutputSchema = bookingSelectSchema;
export type BookingOutput = z.infer<typeof bookingOutputSchema>;
