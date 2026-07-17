import { bookingServices, bookings } from "../schema/booking";
import { clients } from "../schema/client";
import { employees } from "../schema/employee";
import { organizations } from "../schema/organization";
import { vehicles } from "../schema/vehicle";
import type { createDb } from "../index";
import {
  createDefaultOrganizationServices,
  createStableCatalogServiceId,
  loadStoServiceCatalogRows,
} from "../lib/sto-service-catalog";
import { SEED_IDS, SEED_PASSWORD } from "./constants";
import { ensureSeedUser } from "./ensure-user";
import { seedOrganizationWorkingHours } from "./working-hours";

type Db = ReturnType<typeof createDb>;

type SeedUserIds = {
  owner: string;
  manager: string;
  technicianDmytro: string;
  technicianAndrii: string;
  clientMaria: string;
};

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

const SEED_USERS = [
  {
    id: SEED_IDS.users.owner,
    name: "Олександр Коваленко",
    email: "owner@autolab.local",
    firstName: "Олександр",
    lastName: "Коваленко",
    phone: "+380501112233",
  },
  {
    id: SEED_IDS.users.manager,
    name: "Яна Мельник",
    email: "manager@autolab.local",
    firstName: "Яна",
    lastName: "Мельник",
    phone: "+380672223344",
  },
  {
    id: SEED_IDS.users.technicianDmytro,
    name: "Дмитро Шевченко",
    email: "dmytro@autolab.local",
    firstName: "Дмитро",
    lastName: "Шевченко",
    phone: "+380933334455",
  },
  {
    id: SEED_IDS.users.technicianAndrii,
    name: "Андрій Бондаренко",
    email: "andrii@autolab.local",
    firstName: "Андрій",
    lastName: "Бондаренко",
    phone: "+380664445566",
  },
  {
    id: SEED_IDS.users.clientMaria,
    name: "Марія Петренко",
    email: "maria@autolab.local",
    firstName: "Марія",
    lastName: "Петренко",
    middleName: "Іванівна",
    phone: "+380977778899",
  },
] as const;

const CATALOG_SERVICE = {
  engineDiagnostics: createStableCatalogServiceId(74),
  oilChange: createStableCatalogServiceId(76),
  airFilter: createStableCatalogServiceId(77),
  sparkPlugs: createStableCatalogServiceId(79),
  battery: createStableCatalogServiceId(97),
  suspensionDiagnostics: createStableCatalogServiceId(25),
  acRefill: createStableCatalogServiceId(157),
  tireChange: createStableCatalogServiceId(165),
  wheelAlignment: createStableCatalogServiceId(167),
  brakePads: createStableCatalogServiceId(207),
} as const;

const SEED_CLIENTS = [
  {
    id: "seed-client-ivan-mazepa",
    firstName: "Іван",
    lastName: "Мазепа",
    middleName: "Петрович",
    phone: "+380671112233",
  },
  {
    id: "seed-client-olena-kravchenko",
    firstName: "Олена",
    lastName: "Кравченко",
    phone: "+380932223344",
  },
  {
    id: "seed-client-petro-bilenko",
    firstName: "Петро",
    lastName: "Біленко",
    middleName: "Сергійович",
    phone: "+380503334455",
  },
  {
    id: "seed-client-natalia-savchenko",
    firstName: "Наталія",
    lastName: "Савченко",
    phone: "+380664445566",
  },
  {
    id: "seed-client-viktor-lysenko",
    firstName: "Віктор",
    lastName: "Лисенко",
    phone: "+380974556677",
  },
  {
    id: "seed-client-tetiana-honchar",
    firstName: "Тетяна",
    lastName: "Гончар",
    middleName: "Олегівна",
    phone: "+380635667788",
  },
  {
    id: "seed-client-sergii-rudenko",
    firstName: "Сергій",
    lastName: "Руденко",
    phone: "+380687778899",
  },
  {
    id: "seed-client-kateryna-poltava",
    firstName: "Катерина",
    lastName: "Полтава",
    phone: "+380957889900",
    userId: SEED_IDS.users.clientMaria,
  },
] as const;

const SEED_VEHICLES = [
  {
    id: "seed-vehicle-toyota-camry",
    clientId: "seed-client-ivan-mazepa",
    make: "Toyota",
    model: "Camry",
    year: 2018,
    licensePlate: "KA1234AB",
    vin: "4T1B11HK5JU123456",
    engine: "Бензин",
    engineVolume: 2.5,
    bodyStyle: "Седан",
    notes: "Регулярне ТО кожні 10 000 км",
  },
  {
    id: "seed-vehicle-vw-golf",
    clientId: "seed-client-olena-kravchenko",
    make: "Volkswagen",
    model: "Golf",
    year: 2015,
    licensePlate: "AA5678BC",
    vin: "WVWZZZ1KZ6W123457",
    engine: "Дизель",
    engineVolume: 2.0,
    bodyStyle: "Хетчбек",
  },
  {
    id: "seed-vehicle-renault-logan",
    clientId: "seed-client-petro-bilenko",
    make: "Renault",
    model: "Logan",
    year: 2019,
    licensePlate: "BI9012CE",
    vin: "UU1BSDAPHK1234568",
    engine: "Бензин",
    engineVolume: 1.6,
    bodyStyle: "Седан",
  },
  {
    id: "seed-vehicle-skoda-octavia",
    clientId: "seed-client-natalia-savchenko",
    make: "Skoda",
    model: "Octavia",
    year: 2020,
    licensePlate: "AO3456AA",
    vin: "TMBJJ7NE0L1234569",
    engine: "Бензин",
    engineVolume: 1.4,
    bodyStyle: "Універсал",
  },
  {
    id: "seed-vehicle-hyundai-tucson",
    clientId: "seed-client-viktor-lysenko",
    make: "Hyundai",
    model: "Tucson",
    year: 2021,
    licensePlate: "KX7890II",
    vin: "KMHJB81ABMU123457",
    engine: "Бензин",
    engineVolume: 2.0,
    bodyStyle: "Кросовер",
  },
  {
    id: "seed-vehicle-bmw-320d",
    clientId: "seed-client-tetiana-honchar",
    make: "BMW",
    model: "3 Series",
    year: 2016,
    licensePlate: "AE1357HM",
    vin: "WBA8E9G50GNT12345",
    engine: "Дизель",
    engineVolume: 2.0,
    bodyStyle: "Седан",
  },
  {
    id: "seed-vehicle-chevrolet-cruze",
    clientId: "seed-client-sergii-rudenko",
    make: "Chevrolet",
    model: "Cruze",
    year: 2014,
    licensePlate: "CB2468AK",
    vin: "1G1PC5SB0E7123456",
    engine: "Бензин",
    engineVolume: 1.8,
    bodyStyle: "Седан",
  },
  {
    id: "seed-vehicle-ford-focus",
    clientId: "seed-client-kateryna-poltava",
    make: "Ford",
    model: "Focus",
    year: 2017,
    licensePlate: "AI8024BB",
    vin: "1FADP3F2XHL123457",
    engine: "Бензин",
    engineVolume: 1.6,
    bodyStyle: "Хетчбек",
    userId: SEED_IDS.users.clientMaria,
  },
] as const;

const seedUsers = async (db: Db): Promise<SeedUserIds> => {
  const ids = {} as SeedUserIds;

  for (const user of SEED_USERS) {
    const userId = await ensureSeedUser(db, user, SEED_PASSWORD);
    if (user.id === SEED_IDS.users.owner) ids.owner = userId;
    if (user.id === SEED_IDS.users.manager) ids.manager = userId;
    if (user.id === SEED_IDS.users.technicianDmytro) ids.technicianDmytro = userId;
    if (user.id === SEED_IDS.users.technicianAndrii) ids.technicianAndrii = userId;
    if (user.id === SEED_IDS.users.clientMaria) ids.clientMaria = userId;
  }

  return ids;
};

const seedOrganization = async (db: Db) => {
  await db
    .insert(organizations)
    .values({
      id: SEED_IDS.organization,
      name: 'СТО "AutoLab Печерськ"',
      slug: "autolab-pechersk",
      description: "Сучасна станція технічного обслуговування легкових авто в центрі Києва",
      address: "вул. Басейна, 12, Київ, 01023",
      phone: "+380441234567",
      email: "info@autolab.local",
      website: "https://autolab.local",
      latitude: 50.4274,
      longitude: 30.5302,
    })
    .onConflictDoUpdate({
      target: organizations.slug,
      set: {
        name: 'СТО "AutoLab Печерськ"',
        description: "Сучасна станція технічного обслуговування легкових авто в центрі Києва",
        address: "вул. Басейна, 12, Київ, 01023",
        phone: "+380441234567",
        email: "info@autolab.local",
        website: "https://autolab.local",
        latitude: 50.4274,
        longitude: 30.5302,
        updatedAt: new Date(),
      },
    });

  await seedOrganizationWorkingHours(db, SEED_IDS.organization);
};

const seedEmployees = async (db: Db, userIds: SeedUserIds) => {
  const rows = [
    {
      id: "seed-employee-owner",
      userId: userIds.owner,
      role: "OWNER" as const,
      startDate: new Date("2022-03-15"),
    },
    {
      id: "seed-employee-manager",
      userId: userIds.manager,
      role: "MANAGER" as const,
      startDate: new Date("2023-01-10"),
    },
    {
      id: "seed-employee-tech-dmytro",
      userId: userIds.technicianDmytro,
      role: "TECHNICIAN" as const,
      startDate: new Date("2023-06-01"),
    },
    {
      id: "seed-employee-tech-andrii",
      userId: userIds.technicianAndrii,
      role: "TECHNICIAN" as const,
      startDate: new Date("2024-02-20"),
    },
  ];

  for (const employee of rows) {
    await db
      .insert(employees)
      .values({
        id: employee.id,
        userId: employee.userId,
        organizationId: SEED_IDS.organization,
        role: employee.role,
        isActive: true,
        startDate: employee.startDate,
      })
      .onConflictDoUpdate({
        target: [employees.userId, employees.organizationId],
        set: {
          role: employee.role,
          isActive: true,
          updatedAt: new Date(),
        },
      });
  }
};

const seedServices = async (db: Db) =>
  createDefaultOrganizationServices(db, SEED_IDS.organization, {
    createServiceId: createStableCatalogServiceId,
  });

const seedClients = async (db: Db) => {
  for (const client of SEED_CLIENTS) {
    await db
      .insert(clients)
      .values({
        id: client.id,
        organizationId: SEED_IDS.organization,
        firstName: client.firstName,
        lastName: client.lastName,
        middleName: "middleName" in client ? client.middleName : undefined,
        phone: client.phone,
        userId: "userId" in client ? client.userId : undefined,
      })
      .onConflictDoUpdate({
        target: clients.id,
        set: {
          firstName: client.firstName,
          lastName: client.lastName,
          middleName: "middleName" in client ? client.middleName : null,
          phone: client.phone,
          userId: "userId" in client ? client.userId : null,
          updatedAt: new Date(),
        },
      });
  }
};

const seedVehicles = async (db: Db) => {
  for (const vehicle of SEED_VEHICLES) {
    await db
      .insert(vehicles)
      .values({
        id: vehicle.id,
        type: "CAR",
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        vin: vehicle.vin,
        engine: vehicle.engine,
        engineVolume: vehicle.engineVolume,
        bodyStyle: vehicle.bodyStyle,
        notes: "notes" in vehicle ? vehicle.notes : undefined,
        clientId: vehicle.clientId,
        userId: "userId" in vehicle ? vehicle.userId : undefined,
      })
      .onConflictDoUpdate({
        target: vehicles.id,
        set: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          vin: vehicle.vin,
          engine: vehicle.engine,
          engineVolume: vehicle.engineVolume,
          bodyStyle: vehicle.bodyStyle,
          notes: "notes" in vehicle ? vehicle.notes : null,
          clientId: vehicle.clientId,
          userId: "userId" in vehicle ? vehicle.userId : null,
          updatedAt: new Date(),
        },
      });
  }
};

const catalogRows = loadStoServiceCatalogRows();
const serviceById = new Map(
  catalogRows.map((row, index) => [createStableCatalogServiceId(index), row]),
);

const sumBookingItems = (items: readonly { serviceId: string; quantity: number }[]) =>
  items
    .reduce((sum, item) => {
      const service = serviceById.get(item.serviceId);
      return sum + Number(service?.price ?? 0) * item.quantity;
    }, 0)
    .toFixed(2);

const seedBookings = async (db: Db) => {
  const today = startOfDay(new Date());

  const bookingRows = [
    {
      id: "seed-booking-today-oil",
      employeeId: "seed-employee-tech-dmytro",
      vehicleId: "seed-vehicle-toyota-camry",
      startTime: atLocalTime(today, 9, 0),
      endTime: atLocalTime(today, 10, 0),
      status: "PENDING" as const,
      notes: "Клієнт просить оригінальний фільтр Toyota",
      items: [{ serviceId: CATALOG_SERVICE.oilChange, quantity: 1 }],
    },
    {
      id: "seed-booking-today-brakes",
      employeeId: "seed-employee-tech-andrii",
      vehicleId: "seed-vehicle-vw-golf",
      startTime: atLocalTime(today, 10, 30),
      endTime: atLocalTime(today, 12, 30),
      status: "IN_PROGRESS" as const,
      notes: "Скрип передніх колодок, заміна термінова",
      items: [{ serviceId: CATALOG_SERVICE.brakePads, quantity: 1 }],
      allowsOvertime: true,
    },
    {
      id: "seed-booking-tomorrow-alignment",
      employeeId: "seed-employee-tech-dmytro",
      vehicleId: "seed-vehicle-renault-logan",
      startTime: atLocalTime(addDays(today, 1), 11, 0),
      endTime: atLocalTime(addDays(today, 1), 12, 30),
      status: "PENDING" as const,
      items: [{ serviceId: CATALOG_SERVICE.wheelAlignment, quantity: 1 }],
    },
    {
      id: "seed-booking-yesterday-diagnostics",
      employeeId: "seed-employee-tech-andrii",
      vehicleId: "seed-vehicle-skoda-octavia",
      startTime: atLocalTime(addDays(today, -1), 14, 0),
      endTime: atLocalTime(addDays(today, -1), 14, 45),
      status: "COMPLETED" as const,
      items: [{ serviceId: CATALOG_SERVICE.suspensionDiagnostics, quantity: 1 }],
    },
    {
      id: "seed-booking-last-week-ac",
      employeeId: "seed-employee-tech-dmytro",
      vehicleId: "seed-vehicle-hyundai-tucson",
      startTime: atLocalTime(addDays(today, -5), 15, 0),
      endTime: atLocalTime(addDays(today, -5), 16, 15),
      status: "COMPLETED" as const,
      items: [{ serviceId: CATALOG_SERVICE.acRefill, quantity: 1 }],
    },
    {
      id: "seed-booking-next-week-spark-plugs",
      employeeId: "seed-employee-tech-andrii",
      vehicleId: "seed-vehicle-bmw-320d",
      startTime: atLocalTime(addDays(today, 3), 9, 30),
      endTime: atLocalTime(addDays(today, 3), 10, 30),
      status: "PENDING" as const,
      items: [
        { serviceId: CATALOG_SERVICE.sparkPlugs, quantity: 1 },
        { serviceId: CATALOG_SERVICE.airFilter, quantity: 1 },
      ],
    },
    {
      id: "seed-booking-cancelled-battery",
      employeeId: "seed-employee-tech-dmytro",
      vehicleId: "seed-vehicle-chevrolet-cruze",
      startTime: atLocalTime(addDays(today, -2), 12, 0),
      endTime: atLocalTime(addDays(today, -2), 12, 40),
      status: "CANCELLED" as const,
      notes: "Клієнт переніс запис на наступний тиждень",
      items: [{ serviceId: CATALOG_SERVICE.battery, quantity: 1 }],
    },
    {
      id: "seed-booking-today-tires",
      employeeId: "seed-employee-tech-andrii",
      vehicleId: "seed-vehicle-ford-focus",
      startTime: atLocalTime(today, 14, 0),
      endTime: atLocalTime(today, 14, 50),
      status: "PENDING" as const,
      items: [{ serviceId: CATALOG_SERVICE.tireChange, quantity: 1 }],
    },
    {
      id: "seed-booking-today-engine-scan",
      employeeId: "seed-employee-tech-dmytro",
      vehicleId: "seed-vehicle-bmw-320d",
      startTime: atLocalTime(today, 15, 30),
      endTime: atLocalTime(today, 16, 30),
      status: "PENDING" as const,
      notes: "Горить Check Engine, потрібен звіт для страхової",
      items: [{ serviceId: CATALOG_SERVICE.engineDiagnostics, quantity: 1 }],
    },
    {
      id: "seed-booking-multi-day",
      employeeId: "seed-employee-tech-andrii",
      vehicleId: "seed-vehicle-toyota-camry",
      startTime: atLocalTime(addDays(today, 2), 16, 0),
      endTime: atLocalTime(addDays(today, 3), 11, 0),
      status: "PENDING" as const,
      notes: "Капітальне ТО з затримкою через очікування запчастин",
      items: [
        { serviceId: CATALOG_SERVICE.oilChange, quantity: 1 },
        { serviceId: CATALOG_SERVICE.airFilter, quantity: 1 },
        { serviceId: CATALOG_SERVICE.brakePads, quantity: 2 },
      ],
      allowsOvertime: true,
    },
  ] as const;

  for (const booking of bookingRows) {
    await db
      .insert(bookings)
      .values({
        id: booking.id,
        organizationId: SEED_IDS.organization,
        employeeId: booking.employeeId,
        vehicleId: booking.vehicleId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        notes: "notes" in booking ? booking.notes : undefined,
        allowsOvertime: "allowsOvertime" in booking ? booking.allowsOvertime : false,
        totalPrice: sumBookingItems(booking.items),
      })
      .onConflictDoUpdate({
        target: bookings.id,
        set: {
          employeeId: booking.employeeId,
          vehicleId: booking.vehicleId,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          notes: "notes" in booking ? booking.notes : null,
          allowsOvertime: "allowsOvertime" in booking ? booking.allowsOvertime : false,
          totalPrice: sumBookingItems(booking.items),
          updatedAt: new Date(),
        },
      });

    for (const item of booking.items) {
      const service = serviceById.get(item.serviceId);
      if (!service) continue;

      await db
        .insert(bookingServices)
        .values({
          bookingId: booking.id,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: service.price,
          duration: service.duration,
        })
        .onConflictDoUpdate({
          target: [bookingServices.bookingId, bookingServices.serviceId],
          set: {
            quantity: item.quantity,
            unitPrice: service.price,
            duration: service.duration,
          },
        });
    }
  }

  return bookingRows.length;
};

export const seedDemoData = async (db: Db) => {
  const userIds = await seedUsers(db);
  await seedOrganization(db);
  await seedEmployees(db, userIds);
  await seedServices(db);
  await seedClients(db);
  await seedVehicles(db);
  const bookingCount = await seedBookings(db);

  return {
    userIds,
    bookingCount,
    organizationId: SEED_IDS.organization,
  };
};

export const printSeedCredentials = () => {
  console.log("\nSeed accounts (password for all):", SEED_PASSWORD);
  for (const user of SEED_USERS) {
    console.log(`  - ${user.email} (${user.name})`);
  }
  console.log(`\nOrganization: ${SEED_IDS.organization} (slug: autolab-pechersk)`);
  console.log("Open dashboard with: /dashboard?organizationId=seed-org-autolab-pechersk\n");
};
