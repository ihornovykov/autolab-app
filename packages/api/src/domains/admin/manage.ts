import { db } from "@autolab/db";
import { createDefaultOrganizationServices } from "@autolab/db/lib/sto-service-catalog";
import { users } from "@autolab/db/schema/auth";
import { bookings, bookingServices } from "@autolab/db/schema/booking";
import { clients } from "@autolab/db/schema/client";
import { employees } from "@autolab/db/schema/employee";
import { organizations } from "@autolab/db/schema/organization";
import { services } from "@autolab/db/schema/service";
import { vehicles } from "@autolab/db/schema/vehicle";
import { ORPCError } from "@orpc/server";
import { and, count, eq, ilike, inArray } from "drizzle-orm";
import type { z } from "zod";

import { createId, slugify } from "../../lib/scope";

import type {
  createBookingInputSchema,
  createClientInputSchema,
  createEmployeeInputSchema,
  createOrganizationInputSchema,
  createServiceInputSchema,
  createVehicleInputSchema,
  deleteBookingInputSchema,
  deleteClientInputSchema,
  deleteEmployeeInputSchema,
  deleteServiceInputSchema,
  deleteVehicleInputSchema,
  updateBookingInputSchema,
  updateClientInputSchema,
  updateEmployeeInputSchema,
  updateServiceInputSchema,
  updateVehicleInputSchema,
} from "./validation";

const blank = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const requireOrganization = async (organizationId: string) => {
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.id, organizationId),
  });
  if (!organization) throw new ORPCError("NOT_FOUND", { message: "Організацію не знайдено" });
  return organization;
};

export const createOrganization = async (
  input: z.infer<typeof createOrganizationInputSchema>,
) => {
  const ownerEmail = blank(input.ownerEmail);
  const owner = ownerEmail
    ? await db.query.users.findFirst({ where: ilike(users.email, ownerEmail) })
    : null;
  if (ownerEmail && !owner) {
    throw new ORPCError("NOT_FOUND", { message: "Власника з таким email немає" });
  }

  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await db.query.organizations.findFirst({ where: eq(organizations.slug, slug) })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const organizationId = createId();
  const [created] = await db.transaction(async (tx) => {
    const [organization] = await tx
      .insert(organizations)
      .values({
        id: organizationId,
        name: input.name.trim(),
        slug,
        description: blank(input.description),
        address: blank(input.address),
        phone: blank(input.phone),
        email: blank(input.email),
        website: blank(input.website),
      })
      .returning();
    if (!organization) throw new ORPCError("INTERNAL_SERVER_ERROR");
    if (owner) {
      await tx.insert(employees).values({
        id: createId(),
        userId: owner.id,
        organizationId,
        role: "OWNER",
      });
    }
    await createDefaultOrganizationServices(tx, organizationId);
    return [organization];
  });

  if (!created) throw new ORPCError("INTERNAL_SERVER_ERROR");

  return { id: created.id };
};

export const deleteOrganization = async (id: string) => {
  await requireOrganization(id);
  const clientRows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.organizationId, id));
  const clientIds = clientRows.map((row) => row.id);

  await db.transaction(async (tx) => {
    await tx.delete(bookings).where(eq(bookings.organizationId, id));
    if (clientIds.length > 0) {
      await tx.delete(vehicles).where(inArray(vehicles.clientId, clientIds));
    }
    await tx.delete(organizations).where(eq(organizations.id, id));
  });

  return { id };
};

export const createEmployee = async (
  input: z.infer<typeof createEmployeeInputSchema>,
) => {
  await requireOrganization(input.organizationId);
  const user = await db.query.users.findFirst({ where: ilike(users.email, input.email.trim()) });
  if (!user) throw new ORPCError("NOT_FOUND", { message: "Користувача з таким email немає" });

  const existing = await db.query.employees.findFirst({
    where: and(eq(employees.userId, user.id), eq(employees.organizationId, input.organizationId)),
  });
  if (existing) throw new ORPCError("CONFLICT", { message: "Цей користувач уже в майстерні" });

  const id = createId();
  await db.insert(employees).values({
    id,
    userId: user.id,
    organizationId: input.organizationId,
    role: input.role,
  });

  return { id };
};

export const updateEmployee = async (
  input: z.infer<typeof updateEmployeeInputSchema>,
) => {
  if (input.role === undefined && input.isActive === undefined) {
    throw new ORPCError("BAD_REQUEST", { message: "Немає полів для оновлення" });
  }

  const [updated] = await db
    .update(employees)
    .set({
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    })
    .where(and(eq(employees.id, input.employeeId), eq(employees.organizationId, input.organizationId)))
    .returning();
  if (!updated) throw new ORPCError("NOT_FOUND", { message: "Працівника не знайдено" });

  return { id: updated.id };
};

export const deleteEmployee = async (
  input: z.infer<typeof deleteEmployeeInputSchema>,
) => {
  const [used] = await db
    .select({ value: count() })
    .from(bookings)
    .where(eq(bookings.employeeId, input.employeeId));
  if ((used?.value ?? 0) > 0) {
    throw new ORPCError("CONFLICT", { message: "Спочатку видаліть записи цього працівника" });
  }

  const [deleted] = await db
    .delete(employees)
    .where(and(eq(employees.id, input.employeeId), eq(employees.organizationId, input.organizationId)))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Працівника не знайдено" });

  return { id: deleted.id };
};

export const createClient = async (
  input: z.infer<typeof createClientInputSchema>,
) => {
  await requireOrganization(input.organizationId);
  const id = createId();
  await db.insert(clients).values({
    id,
    organizationId: input.organizationId,
    firstName: input.firstName.trim(),
    lastName: blank(input.lastName),
    phone: blank(input.phone),
  });

  return { id };
};

export const deleteClient = async (
  input: z.infer<typeof deleteClientInputSchema>,
) => {
  const [deleted] = await db
    .delete(clients)
    .where(and(eq(clients.id, input.clientId), eq(clients.organizationId, input.organizationId)))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Клієнта не знайдено" });

  return { id: deleted.id };
};

export const createVehicle = async (
  input: z.infer<typeof createVehicleInputSchema>,
) => {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, input.clientId), eq(clients.organizationId, input.organizationId)),
  });
  if (!client) throw new ORPCError("BAD_REQUEST", { message: "Клієнт не належить цій майстерні" });

  const id = createId();
  await db.insert(vehicles).values({
    id,
    clientId: input.clientId,
    make: input.make.trim(),
    model: input.model.trim(),
    year: input.year,
    licensePlate: blank(input.licensePlate),
  });

  return { id };
};

export const deleteVehicle = async (
  input: z.infer<typeof deleteVehicleInputSchema>,
) => {
  const vehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, input.vehicleId),
    with: { client: true },
  });
  if (!vehicle || vehicle.client?.organizationId !== input.organizationId) {
    throw new ORPCError("NOT_FOUND", { message: "Авто не знайдено" });
  }

  const [used] = await db
    .select({ value: count() })
    .from(bookings)
    .where(eq(bookings.vehicleId, input.vehicleId));
  if ((used?.value ?? 0) > 0) {
    throw new ORPCError("CONFLICT", { message: "Спочатку видаліть записи цього авто" });
  }

  await db.delete(vehicles).where(eq(vehicles.id, input.vehicleId));

  return { id: input.vehicleId };
};

export const createService = async (
  input: z.infer<typeof createServiceInputSchema>,
) => {
  await requireOrganization(input.organizationId);
  const price = Number(input.price);
  if (Number.isNaN(price) || price < 0) {
    throw new ORPCError("BAD_REQUEST", { message: "Некоректна ціна" });
  }

  const id = createId();
  await db.insert(services).values({
    id,
    organizationId: input.organizationId,
    title: input.title.trim(),
    category: blank(input.category),
    price: price.toFixed(2),
    duration: input.duration,
  });

  return { id };
};

export const deleteService = async (
  input: z.infer<typeof deleteServiceInputSchema>,
) => {
  const [used] = await db
    .select({ value: count() })
    .from(bookingServices)
    .where(eq(bookingServices.serviceId, input.serviceId));
  if ((used?.value ?? 0) > 0) {
    throw new ORPCError("CONFLICT", { message: "Послуга використовується в записах" });
  }

  const [deleted] = await db
    .delete(services)
    .where(and(eq(services.id, input.serviceId), eq(services.organizationId, input.organizationId)))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Послугу не знайдено" });

  return { id: deleted.id };
};

export const createBooking = async (
  input: z.infer<typeof createBookingInputSchema>,
) => {
  const employee = await db.query.employees.findFirst({
    where: and(eq(employees.id, input.employeeId), eq(employees.organizationId, input.organizationId)),
  });
  if (!employee) throw new ORPCError("BAD_REQUEST", { message: "Працівник не належить цій майстерні" });

  const vehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, input.vehicleId),
    with: { client: true },
  });
  if (!vehicle || vehicle.client?.organizationId !== input.organizationId) {
    throw new ORPCError("BAD_REQUEST", { message: "Авто не належить цій майстерні" });
  }

  const service = await db.query.services.findFirst({
    where: and(eq(services.id, input.serviceId), eq(services.organizationId, input.organizationId)),
  });
  if (!service) throw new ORPCError("BAD_REQUEST", { message: "Послуга не належить цій майстерні" });

  const startTime = new Date(input.startTime);
  const endTime = new Date(startTime.getTime() + service.duration * input.quantity * 60_000);
  const unitPrice = Number(service.price).toFixed(2);
  const id = createId();

  await db.transaction(async (tx) => {
    await tx.insert(bookings).values({
      id,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      vehicleId: input.vehicleId,
      startTime,
      endTime,
      totalPrice: (Number(unitPrice) * input.quantity).toFixed(2),
    });
    await tx.insert(bookingServices).values({
      bookingId: id,
      serviceId: service.id,
      quantity: input.quantity,
      unitPrice,
      duration: service.duration,
    });
  });

  return { id };
};

export const deleteBooking = async (
  input: z.infer<typeof deleteBookingInputSchema>,
) => {
  const [deleted] = await db
    .delete(bookings)
    .where(and(eq(bookings.id, input.bookingId), eq(bookings.organizationId, input.organizationId)))
    .returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Запис не знайдено" });

  return { id: deleted.id };
};

const money = (value: string, label: string) => {
  const amount = Number(value);
  if (Number.isNaN(amount) || amount < 0) {
    throw new ORPCError("BAD_REQUEST", { message: `Некоректна сума: ${label}` });
  }
  return amount.toFixed(2);
};

const isUniqueViolation = (error: unknown) => {
  const candidate = error as { code?: string; cause?: { code?: string } };
  return candidate.code === "23505" || candidate.cause?.code === "23505";
};

export const updateClient = async (
  input: z.infer<typeof updateClientInputSchema>,
) => {
  const [updated] = await db
    .update(clients)
    .set({
      firstName: input.firstName.trim(),
      lastName: blank(input.lastName ?? undefined),
      middleName: blank(input.middleName ?? undefined),
      phone: blank(input.phone ?? undefined),
    })
    .where(and(eq(clients.id, input.clientId), eq(clients.organizationId, input.organizationId)))
    .returning();
  if (!updated) throw new ORPCError("NOT_FOUND", { message: "Клієнта не знайдено" });

  return { id: updated.id };
};

export const updateVehicle = async (
  input: z.infer<typeof updateVehicleInputSchema>,
) => {
  const current = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, input.vehicleId),
    with: { client: true },
  });
  if (!current || current.client?.organizationId !== input.organizationId) {
    throw new ORPCError("NOT_FOUND", { message: "Авто не знайдено" });
  }

  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, input.clientId), eq(clients.organizationId, input.organizationId)),
  });
  if (!client) throw new ORPCError("BAD_REQUEST", { message: "Клієнт не належить цій майстерні" });

  try {
    const [updated] = await db
      .update(vehicles)
      .set({
        clientId: input.clientId,
        type: input.type,
        make: input.make.trim(),
        model: input.model.trim(),
        year: input.year,
        licensePlate: blank(input.licensePlate ?? undefined),
        vin: blank(input.vin ?? undefined),
        engine: blank(input.engine ?? undefined),
        engineVolume: input.engineVolume ?? null,
        bodyStyle: blank(input.bodyStyle ?? undefined),
        notes: blank(input.notes ?? undefined),
      })
      .where(eq(vehicles.id, input.vehicleId))
      .returning();
    if (!updated) throw new ORPCError("NOT_FOUND", { message: "Авто не знайдено" });

    return { id: updated.id };
  } catch (error) {
    if (error instanceof ORPCError) throw error;
    if (isUniqueViolation(error)) {
      throw new ORPCError("CONFLICT", { message: "Такий VIN уже є" });
    }
    throw error;
  }
};

export const updateService = async (
  input: z.infer<typeof updateServiceInputSchema>,
) => {
  const price = money(input.price, "ціна");
  const [updated] = await db
    .update(services)
    .set({
      title: input.title.trim(),
      category: blank(input.category ?? undefined),
      description: blank(input.description ?? undefined),
      price,
      duration: input.duration,
    })
    .where(and(eq(services.id, input.serviceId), eq(services.organizationId, input.organizationId)))
    .returning();
  if (!updated) throw new ORPCError("NOT_FOUND", { message: "Послугу не знайдено" });

  return { id: updated.id };
};

export const updateBooking = async (
  input: z.infer<typeof updateBookingInputSchema>,
) => {
  const existing = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, input.bookingId), eq(bookings.organizationId, input.organizationId)),
  });
  if (!existing) throw new ORPCError("NOT_FOUND", { message: "Запис не знайдено" });

  const employee = await db.query.employees.findFirst({
    where: and(eq(employees.id, input.employeeId), eq(employees.organizationId, input.organizationId)),
  });
  if (!employee) throw new ORPCError("BAD_REQUEST", { message: "Працівник не належить цій майстерні" });

  const vehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, input.vehicleId),
    with: { client: true },
  });
  if (!vehicle || vehicle.client?.organizationId !== input.organizationId) {
    throw new ORPCError("BAD_REQUEST", { message: "Авто не належить цій майстерні" });
  }

  const serviceIds = input.items.map((item) => item.serviceId);
  if (new Set(serviceIds).size !== serviceIds.length) {
    throw new ORPCError("BAD_REQUEST", { message: "Послуга в записі не може повторюватися" });
  }

  const selected = await db.query.services.findMany({
    where: and(inArray(services.id, serviceIds), eq(services.organizationId, input.organizationId)),
  });
  if (selected.length !== serviceIds.length) {
    throw new ORPCError("BAD_REQUEST", { message: "Послуга не належить цій майстерні" });
  }

  const totalPrice = money(input.totalPrice, "сума");
  const lines = input.items.map((item) => ({
    bookingId: input.bookingId,
    serviceId: item.serviceId,
    quantity: item.quantity,
    unitPrice: money(item.unitPrice, "ціна послуги"),
    duration: item.duration,
  }));

  await db.transaction(async (tx) => {
    await tx
      .update(bookings)
      .set({
        employeeId: input.employeeId,
        vehicleId: input.vehicleId,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        allowsOvertime: input.allowsOvertime,
        status: input.status,
        notes: blank(input.notes ?? undefined),
        totalPrice,
      })
      .where(eq(bookings.id, input.bookingId));
    await tx.delete(bookingServices).where(eq(bookingServices.bookingId, input.bookingId));
    await tx.insert(bookingServices).values(lines);
  });

  return { id: input.bookingId };
};
