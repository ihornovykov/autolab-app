import {
  computeBookingDiscountAmount,
  computeBookingSubtotal,
} from "@/features/booking/lib/compute-booking-total";
import { formatPrice } from "@/shared/lib/money";
import { cn } from "@autolab/ui/lib/utils";

type BookingServiceForDiscount = {
  quantity?: number;
  unitPrice?: string;
  price?: string;
};

type Props = {
  services: BookingServiceForDiscount[];
  totalPrice: string | number;
  showSubtotal?: boolean;
  className?: string;
};

export const BookingDiscountDisplay = ({
  services,
  totalPrice,
  showSubtotal = false,
  className,
}: Props) => {
  const subtotal = computeBookingSubtotal(services);
  const discount = computeBookingDiscountAmount(subtotal, totalPrice);

  if (discount <= 0) return null;

  return (
    <div className={cn("space-y-0.5", className)}>
      {showSubtotal ? (
        <p className="text-sm text-muted-foreground line-through tabular-nums">
          {formatPrice(subtotal)}
        </p>
      ) : null}
      <p className="text-sm font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
        Знижка: −{formatPrice(discount)}
      </p>
    </div>
  );
};
