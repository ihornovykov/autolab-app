import { bookings } from "@autolab/db/schema/booking";
import { vehicles } from "@autolab/db/schema/vehicle";
import dayjs from "dayjs";
import { sql } from "drizzle-orm";

import { buildVehicleSearchCondition } from "../../lib/vehicle";

import type { GlobalSearchResult } from "./validation";

export const MATCH_LIMIT = 5;
export const RELATED_LIMIT = 3;

export type SearchCollector = {
  items: GlobalSearchResult[];
  seen: Set<string>;
  limit: number;
};

export const addResult = (collector: SearchCollector, item: GlobalSearchResult) => {
  const key = `${item.type}:${item.id}`;
  if (collector.seen.has(key) || collector.items.length >= collector.limit) return false;

  collector.seen.add(key);
  collector.items.push(item);
  return true;
};

export const formatBookingMeta = (startTime: Date, totalPrice: string) =>
  `${dayjs(startTime).format("D MMM YYYY, HH:mm")} · ${totalPrice} грн`;

export const vehicleSearchColumns = {
  make: vehicles.make,
  model: vehicles.model,
  licensePlate: vehicles.licensePlate,
  vin: vehicles.vin,
};

export const vehicleExistsMatch = (rawSearch: string) => {
  const match = buildVehicleSearchCondition(vehicleSearchColumns, rawSearch);
  return match
    ? sql`exists (
        select 1 from ${vehicles}
        where ${vehicles.id} = ${bookings.vehicleId}
        and ${match}
      )`
    : sql`false`;
};
