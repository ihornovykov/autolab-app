import { z } from "zod";

import { adminProcedure } from "../../index";

import {
  createBooking,
  createClient,
  createEmployee,
  createOrganization,
  createService,
  createVehicle,
  deleteBooking,
  deleteClient,
  deleteEmployee,
  deleteOrganization,
  deleteService,
  deleteVehicle,
  updateBooking,
  updateClient,
  updateEmployee,
  updateService,
  updateVehicle,
} from "./manage";
import {
  createVehicleMake,
  createVehicleModel,
  deleteVehicleMake,
  deleteVehicleModel,
  getBooking,
  getOrganization,
  getOverview,
  getUser,
  listOrganizationClients,
  listOrganizationEmployees,
  listOrganizationServices,
  listOrganizationVehicles,
  listBookings,
  listOrganizations,
  listUsers,
  listVehicleMakes,
  listVehicleModels,
  setBookingStatus,
  updateOrganization,
  updateVehicleMake,
  updateVehicleModel,
} from "./services";
import {
  listBookingsInputSchema,
  listModelsInputSchema,
  listOrganizationsInputSchema,
  listOrganizationsOutputSchema,
  listUsersInputSchema,
  listUsersOutputSchema,
  listBookingsOutputSchema,
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
  makeInputSchema,
  modelInputSchema,
  organizationIdSchema,
  organizationScopeInputSchema,
  updateBookingInputSchema,
  updateClientInputSchema,
  updateEmployeeInputSchema,
  updateServiceInputSchema,
  updateVehicleInputSchema,
  overviewInputSchema,
  overviewOutputSchema,
  setBookingStatusInputSchema,
  updateMakeInputSchema,
  updateModelInputSchema,
  updateOrganizationInputSchema,
} from "./validation";

const loose = z.any();

export const adminRoutes = {
  overview: {
    getOverview: adminProcedure
      .input(overviewInputSchema)
      .output(overviewOutputSchema)
      .handler(({ input }) => getOverview(input)),
  },
  organization: {
    listOrganizations: adminProcedure
      .input(listOrganizationsInputSchema)
      .output(listOrganizationsOutputSchema)
      .handler(({ input }) => listOrganizations(input)),
    getOrganization: adminProcedure
      .input(organizationIdSchema)
      .output(loose)
      .handler(({ input }) => getOrganization(input.id)),
    updateOrganization: adminProcedure
      .input(updateOrganizationInputSchema)
      .output(loose)
      .handler(({ input }) => updateOrganization(input)),
    createOrganization: adminProcedure
      .input(createOrganizationInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => createOrganization(input)),
    deleteOrganization: adminProcedure
      .input(organizationIdSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => deleteOrganization(input.id)),
    createEmployee: adminProcedure
      .input(createEmployeeInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => createEmployee(input)),
    updateEmployee: adminProcedure
      .input(updateEmployeeInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => updateEmployee(input)),
    updateClient: adminProcedure
      .input(updateClientInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => updateClient(input)),
    updateVehicle: adminProcedure
      .input(updateVehicleInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => updateVehicle(input)),
    updateService: adminProcedure
      .input(updateServiceInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => updateService(input)),
    deleteEmployee: adminProcedure
      .input(deleteEmployeeInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => deleteEmployee(input)),
    createClient: adminProcedure
      .input(createClientInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => createClient(input)),
    deleteClient: adminProcedure
      .input(deleteClientInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => deleteClient(input)),
    createVehicle: adminProcedure
      .input(createVehicleInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => createVehicle(input)),
    deleteVehicle: adminProcedure
      .input(deleteVehicleInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => deleteVehicle(input)),
    createService: adminProcedure
      .input(createServiceInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => createService(input)),
    deleteService: adminProcedure
      .input(deleteServiceInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => deleteService(input)),
    listEmployees: adminProcedure
      .input(organizationScopeInputSchema)
      .output(loose)
      .handler(({ input }) => listOrganizationEmployees(input)),
    listClients: adminProcedure
      .input(organizationScopeInputSchema)
      .output(loose)
      .handler(({ input }) => listOrganizationClients(input)),
    listVehicles: adminProcedure
      .input(organizationScopeInputSchema)
      .output(loose)
      .handler(({ input }) => listOrganizationVehicles(input)),
    listServices: adminProcedure
      .input(organizationScopeInputSchema)
      .output(loose)
      .handler(({ input }) => listOrganizationServices(input)),
  },
  user: {
    listUsers: adminProcedure
      .input(listUsersInputSchema)
      .output(listUsersOutputSchema)
      .handler(({ input }) => listUsers(input)),
    getUser: adminProcedure
      .input(organizationIdSchema)
      .output(loose)
      .handler(({ input }) => getUser(input.id)),
  },
  booking: {
    listBookings: adminProcedure
      .input(listBookingsInputSchema)
      .output(listBookingsOutputSchema)
      .handler(({ input }) => listBookings(input)),
    getBooking: adminProcedure
      .input(organizationIdSchema)
      .output(loose)
      .handler(({ input }) => getBooking(input.id)),
    setBookingStatus: adminProcedure
      .input(setBookingStatusInputSchema)
      .output(z.object({ id: z.string(), status: z.string() }))
      .handler(({ input }) => setBookingStatus(input)),
    createBooking: adminProcedure
      .input(createBookingInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => createBooking(input)),
    deleteBooking: adminProcedure
      .input(deleteBookingInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => deleteBooking(input)),
    updateBooking: adminProcedure
      .input(updateBookingInputSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => updateBooking(input)),
  },
  catalog: {
    listVehicleMakes: adminProcedure
      .input(z.object({ page: z.number().default(1), pageSize: z.number().default(25), search: z.string().optional() }))
      .output(loose)
      .handler(({ input }) => listVehicleMakes(input.page, input.pageSize, input.search)),
    createVehicleMake: adminProcedure
      .input(makeInputSchema)
      .output(loose)
      .handler(({ input }) => createVehicleMake(input.name)),
    updateVehicleMake: adminProcedure
      .input(updateMakeInputSchema)
      .output(loose)
      .handler(({ input }) => updateVehicleMake(input)),
    deleteVehicleMake: adminProcedure
      .input(organizationIdSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => deleteVehicleMake(input.id)),
    listVehicleModels: adminProcedure
      .input(listModelsInputSchema)
      .output(loose)
      .handler(({ input }) => listVehicleModels(input)),
    createVehicleModel: adminProcedure
      .input(modelInputSchema)
      .output(loose)
      .handler(({ input }) => createVehicleModel(input)),
    updateVehicleModel: adminProcedure
      .input(updateModelInputSchema)
      .output(loose)
      .handler(({ input }) => updateVehicleModel(input)),
    deleteVehicleModel: adminProcedure
      .input(organizationIdSchema)
      .output(z.object({ id: z.string() }))
      .handler(({ input }) => deleteVehicleModel(input.id)),
  },
};
