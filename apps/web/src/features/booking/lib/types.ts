export type BookingRow = {
  id: string;
  employeeId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startTime: Date;
  endTime: Date;
  allowsOvertime?: boolean;
  notes?: string | null;
  totalPrice: string;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string | null;
  };
  employee?: {
    id: string;
    userId: string;
    role: "TECHNICIAN" | "MANAGER" | "OWNER";
    name?: string;
  };
  services?: Array<{
    id: string;
    title: string;
    price?: string;
    duration?: number;
    quantity?: number;
    unitPrice?: string;
  }>;
};

export type VehicleBookingHistoryItem = {
  id: string;
  employeeId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startTime: Date;
  endTime: Date;
  allowsOvertime?: boolean;
  notes?: string | null;
  totalPrice: string;
  services?: Array<{
    id: string;
    title: string;
    price?: string;
    unitPrice?: string;
    quantity?: number;
    duration?: number;
  }>;
};

export type BookingServiceCatalogItem = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  price: string;
  duration: number;
};

export type BookingServiceLineItem = {
  serviceId: string;
  quantity: number;
  unitPrice: string;
};

export type BookingLineItemForTotal = {
  quantity?: number;
  unitPrice?: string;
  price?: string;
};

export type BookingStatusFilter = "ALL" | BookingRow["status"];

export type BookingDateGroup = {
  key: string;
  label: string;
  bookings: BookingRow[];
};
