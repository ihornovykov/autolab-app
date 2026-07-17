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
