import type { BookingServiceLineItem } from "@/features/booking/ui/booking-service-picker";

export type BookingLineItemForTotal = {
  quantity?: number;
  unitPrice?: string;
  price?: string;
};

export const computeBookingItemsTotal = (items: BookingServiceLineItem[]) =>
  items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

export const computeBookingSubtotal = (items: BookingLineItemForTotal[]) =>
  items.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
    const quantity = item.quantity ?? 1;
    return sum + unitPrice * quantity;
  }, 0);

export const computeBookingDiscountAmount = (subtotal: number, totalPrice: string | number) => {
  const discount = subtotal - Number(totalPrice);
  if (discount < 0.005) return 0;
  return discount;
};

export const formatBookingTotalPrice = (value: number) => value.toFixed(2);
