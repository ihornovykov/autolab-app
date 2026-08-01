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
