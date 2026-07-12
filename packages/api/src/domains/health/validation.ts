import { z } from "zod";

export const healthCheckOutputSchema = z.literal("OK");
export type HealthCheckOutput = z.infer<typeof healthCheckOutputSchema>;
