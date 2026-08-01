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
      toast.error("Не вдалося згенерувати квитанцію.");
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      icon={printMutation.isPending ? <Loader2 className="animate-spin" /> : <PrinterIcon />}
      disabled={printMutation.isPending}
      onClick={() => printMutation.mutate()}
    >
      Друк квитанції
    </Button>
  );
};
