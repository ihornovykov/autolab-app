import { bookingServices, bookings } from "../schema/booking";
import { clients } from "../schema/client";
import { organizations } from "../schema/organization";
import { services } from "../schema/service";
import { vehicles } from "../schema/vehicle";
import { eq, sql } from "drizzle-orm";

import type { createDb } from "../index";
import { SEED_IDS } from "./constants";

type Db = ReturnType<typeof createDb>;

export type StressSeedConfig = {
  clientCount: number;
  extraServiceCount: number;
  bookingCount: number;
};

export const DEFAULT_STRESS_SEED_CONFIG: StressSeedConfig = {
  clientCount: 150,
  extraServiceCount: 40,
  bookingCount: 600,
};

const STRESS_PREFIX = "stress";

const FIRST_NAMES = [
  "Олександр",
  "Андрій",
  "Дмитро",
  "Іван",
  "Максим",
  "Сергій",
  "Володимир",
  "Михайло",
  "Тарас",
  "Роман",
  "Олена",
  "Марія",
  "Наталія",
  "Ірина",
  "Юлія",
  "Катерина",
  "Тетяна",
  "Анна",
  "Вікторія",
  "Софія",
] as const;

const LAST_NAMES = [
  "Коваленко",
  "Шевченко",
  "Бондаренко",
  "Мельник",
  "Ткаченко",
  "Кравченко",
  "Олійник",
  "Савченко",
  "Петренко",
  "Іваненко",
  "Гриценко",
  "Лисенко",
  "Руденко",
  "Полтава",
  "Мазепа",
  "Гончар",
  "Біленко",
  "Коваль",
  "Мороз",
  "Литвин",
] as const;

const VEHICLE_PAIRS = [
  { make: "Toyota", model: "Camry" },
  { make: "Toyota", model: "Corolla" },
  { make: "Volkswagen", model: "Golf" },
  { make: "Volkswagen", model: "Passat" },
  { make: "Renault", model: "Logan" },
  { make: "Renault", model: "Duster" },
  { make: "Skoda", model: "Octavia" },
  { make: "Hyundai", model: "Tucson" },
  { make: "BMW", model: "3 Series" },
  { make: "Chevrolet", model: "Cruze" },
  { make: "Ford", model: "Focus" },
  { make: "Ford", model: "Kuga" },
  { make: "Nissan", model: "Qashqai" },
  { make: "Honda", model: "Civic" },
  { make: "Kia", model: "Sportage" },
] as const;

const BODY_STYLES = ["Седан", "Хетчбек", "Універсал", "Кросовер", "Мінівен"] as const;
const ENGINES = ["Бензин", "Дизель", "Гібрид"] as const;

const EMPLOYEE_IDS = [
  "seed-employee-tech-dmytro",
  "seed-employee-tech-andrii",
  "seed-employee-manager",
] as const;

const BOOKING_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
type BookingStatus = (typeof BOOKING_STATUSES)[number];

const atLocalTime = (date: Date, hours: number, minutes = 0) => {
  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const addDays = (date: Date, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const startOfDay = (date: Date) => atLocalTime(date, 0, 0);

const pad = (value: number, length: number) => String(value).padStart(length, "0");

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const pick = <T>(items: readonly T[], index: number) => items[index % items.length]!;

const buildLicensePlate = (index: number) => {
  const letters = "ABCDEFGHKLMNOPRSTUVXZ";
  const first = letters[index % letters.length]!;
  const second = letters[(index * 3) % letters.length]!;
  const third = letters[(index * 5) % letters.length]!;
  const fourth = letters[(index * 7) % letters.length]!;
  return `${first}${second}${pad(index % 10000, 4)}${third}${fourth}`;
};

const resolveBookingStatus = (startTime: Date, today: Date, index: number): BookingStatus => {
  if (startTime < today) {
    return index % 12 === 0 ? "CANCELLED" : "COMPLETED";
  }

  if (startTime.toDateString() === today.toDateString()) {
    if (index % 4 === 0) return "IN_PROGRESS";
    if (index % 17 === 0) return "CANCELLED";
    return "PENDING";
  }

  return index % 23 === 0 ? "CANCELLED" : "PENDING";
};

const seedStressServices = async (db: Db, count: number) => {
  if (count <= 0) return 0;

  const rows = Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    return {
      id: `${STRESS_PREFIX}-service-${pad(number, 3)}`,
      organizationId: SEED_IDS.organization,
      title: `Тестова послуга ${pad(number, 2)}`,
      description: `Автогенерована послуга для навантажувального тесту #${number}`,
      price: (250 + (index % 45) * 75).toFixed(2),
      duration: 30 + (index % 8) * 15,
    };
  });

  for (const batch of chunk(rows, 100)) {
    await db
      .insert(services)
      .values(batch)
      .onConflictDoUpdate({
        target: services.id,
        set: {
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          price: sql`excluded.price`,
          duration: sql`excluded.duration`,
          updatedAt: new Date(),
        },
      });
  }

  return rows.length;
};

const seedStressClients = async (db: Db, count: number) => {
  const rows = Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    return {
      id: `${STRESS_PREFIX}-client-${pad(number, 4)}`,
      organizationId: SEED_IDS.organization,
      firstName: pick(FIRST_NAMES, index),
      lastName: pick(LAST_NAMES, index + 3),
      middleName: index % 3 === 0 ? `${pick(FIRST_NAMES, index + 5)}ович` : undefined,
      phone: `+380${pad(50 + (index % 40), 2)}${pad(1000000 + index, 7)}`,
    };
  });

  for (const batch of chunk(rows, 100)) {
    await db
      .insert(clients)
      .values(batch)
      .onConflictDoUpdate({
        target: clients.id,
        set: {
          firstName: sql`excluded.first_name`,
          lastName: sql`excluded.last_name`,
          middleName: sql`excluded.middle_name`,
          phone: sql`excluded.phone`,
          updatedAt: new Date(),
        },
      });
  }

  return rows.map((row) => row.id);
};

const seedStressVehicles = async (db: Db, clientIds: string[]) => {
  const rows: Array<typeof vehicles.$inferInsert> = [];
  let vehicleIndex = 0;

  for (const [clientIndex, clientId] of clientIds.entries()) {
    const vehicleCount = clientIndex % 4 === 0 ? 2 : 1;

    for (let slot = 0; slot < vehicleCount; slot += 1) {
      vehicleIndex += 1;
      const pair = pick(VEHICLE_PAIRS, vehicleIndex);
      const year = 2010 + (vehicleIndex % 14);

      rows.push({
        id: `${STRESS_PREFIX}-vehicle-${pad(vehicleIndex, 5)}`,
        type: "CAR",
        make: pair.make,
        model: pair.model,
        year,
        licensePlate: buildLicensePlate(vehicleIndex),
        vin: `STRESS${pad(vehicleIndex, 13)}`,
        engine: pick(ENGINES, vehicleIndex),
        engineVolume: 1.4 + (vehicleIndex % 6) * 0.3,
        bodyStyle: pick(BODY_STYLES, vehicleIndex),
        clientId,
      });
    }
  }

  for (const batch of chunk(rows, 100)) {
    await db
      .insert(vehicles)
      .values(batch)
      .onConflictDoUpdate({
        target: vehicles.id,
        set: {
          make: sql`excluded.make`,
          model: sql`excluded.model`,
          year: sql`excluded.year`,
          licensePlate: sql`excluded.license_plate`,
          vin: sql`excluded.vin`,
          engine: sql`excluded.engine`,
          engineVolume: sql`excluded.engine_volume`,
          bodyStyle: sql`excluded.body_style`,
          clientId: sql`excluded.client_id`,
          updatedAt: new Date(),
        },
      });
  }

  return rows.map((row) => row.id);
};

const seedStressBookings = async (
  db: Db,
  vehicleIds: string[],
  serviceCatalog: Array<{ id: string; price: string; duration: number }>,
  count: number,
) => {
  if (vehicleIds.length === 0 || serviceCatalog.length === 0) return 0;

  const today = startOfDay(new Date());
  const bookingRows: Array<typeof bookings.$inferInsert> = [];
  const bookingServiceRows: Array<typeof bookingServices.$inferInsert> = [];

  for (let index = 0; index < count; index += 1) {
    const number = index + 1;
    const dayOffset = (index % 151) - 90;
    const hour = 8 + (index % 9);
    const minute = (index % 4) * 15;
    const startTime = atLocalTime(addDays(today, dayOffset), hour, minute);

    const serviceCount = 1 + (index % 3);
    const selectedServices = Array.from({ length: serviceCount }, (_, serviceIndex) =>
      pick(serviceCatalog, index + serviceIndex * 5),
    );

    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
    const totalPrice = selectedServices
      .reduce((sum, service) => sum + Number(service.price), 0)
      .toFixed(2);
    const endTime = new Date(startTime.getTime() + totalDuration * 60_000);
    const bookingId = `${STRESS_PREFIX}-booking-${pad(number, 5)}`;

    bookingRows.push({
      id: bookingId,
      organizationId: SEED_IDS.organization,
      employeeId: pick(EMPLOYEE_IDS, index),
      vehicleId: pick(vehicleIds, index),
      startTime,
      endTime,
      status: resolveBookingStatus(startTime, today, index),
      notes: index % 5 === 0 ? `Тестовий запис #${number}` : undefined,
      allowsOvertime: index % 11 === 0,
      totalPrice,
    });

    for (const service of selectedServices) {
      bookingServiceRows.push({
        bookingId,
        serviceId: service.id,
      });
    }
  }

  for (const batch of chunk(bookingRows, 100)) {
    await db
      .insert(bookings)
      .values(batch)
      .onConflictDoUpdate({
        target: bookings.id,
        set: {
          employeeId: sql`excluded.employee_id`,
          vehicleId: sql`excluded.vehicle_id`,
          startTime: sql`excluded.start_time`,
          endTime: sql`excluded.end_time`,
          status: sql`excluded.status`,
          notes: sql`excluded.notes`,
          allowsOvertime: sql`excluded.allows_overtime`,
          totalPrice: sql`excluded.total_price`,
          updatedAt: new Date(),
        },
      });
  }

  for (const batch of chunk(bookingServiceRows, 250)) {
    await db.insert(bookingServices).values(batch).onConflictDoNothing();
  }

  return bookingRows.length;
};

export const seedStressData = async (
  db: Db,
  config: StressSeedConfig = DEFAULT_STRESS_SEED_CONFIG,
) => {
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.id, SEED_IDS.organization),
    columns: { id: true },
  });

  if (!organization) {
    throw new Error(
      `Organization ${SEED_IDS.organization} not found. Run "pnpm db:seed" before stress seed.`,
    );
  }

  const extraServiceCount = await seedStressServices(db, config.extraServiceCount);
  const clientIds = await seedStressClients(db, config.clientCount);
  const vehicleIds = await seedStressVehicles(db, clientIds);

  const serviceCatalog = await db.query.services.findMany({
    where: eq(services.organizationId, SEED_IDS.organization),
    columns: { id: true, price: true, duration: true },
  });

  const bookingCount = await seedStressBookings(
    db,
    vehicleIds,
    serviceCatalog,
    config.bookingCount,
  );

  return {
    organizationId: SEED_IDS.organization,
    clients: clientIds.length,
    vehicles: vehicleIds.length,
    services: extraServiceCount,
    bookings: bookingCount,
    totalServices: serviceCatalog.length,
  };
};
