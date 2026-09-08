import { useMutation } from "@tanstack/react-query";
import { Loader2, PrinterIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createPdfBlobFromBase64,
  printPdfBlob,
} from "@/features/booking/lib/utils";
import { client } from "@/shared/api/orpc";
import { Button } from "@autolab/ui/components/button";

type Props = {
  organizationId: string;
  bookingId: string;
};

export const PrintBookingReceiptButton = ({ organizationId, bookingId }: Props) => {
  const printMutation = useMutation({
    mutationFn: () =>
      client.booking.getBookingReceiptPdf({
        organizationId,
        bookingId,
      }),
    onSuccess: (result) => {
      const blob = createPdfBlobFromBase64(result.pdfBase64, result.contentType);
      printPdfBlob(blob);
    },
    onError: () => {
      toast.error("Не вдалося згенерувати акт.");
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="sm:h-9 sm:w-auto sm:px-4"
      icon={printMutation.isPending ? <Loader2 className="animate-spin" /> : <PrinterIcon />}
      aria-label="Друк акта"
      disabled={printMutation.isPending}
      onClick={() => printMutation.mutate()}
    >
      <span className="hidden sm:inline">Друк акта</span>
    </Button>
  );
};
