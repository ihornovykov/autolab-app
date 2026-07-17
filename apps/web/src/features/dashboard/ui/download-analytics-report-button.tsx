import { useMutation } from "@tanstack/react-query";
import { DownloadIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { toListBookingsDateRange } from "@/features/booking/lib/date-range-filter";
import {
  createPdfBlobFromBase64,
  downloadPdfBlob,
} from "@/features/booking/lib/print-booking-receipt";
import { client } from "@/shared/api/orpc";
import { Button } from "@autolab/ui/components/button";
import type { DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";

type Props = {
  organizationId: string;
  dateRange: DateRangeFilterValue | null;
};

export const DownloadAnalyticsReportButton = ({ organizationId, dateRange }: Props) => {
  const range = toListBookingsDateRange(dateRange);

  const downloadMutation = useMutation({
    mutationFn: () => {
      if (!range.from || !range.to) {
        throw new Error("Оберіть період для звіту");
      }

      return client.booking.exportOrganizationAnalyticsPdf({
        organizationId,
        from: range.from,
        to: range.to,
      });
    },
    onSuccess: (result) => {
      const blob = createPdfBlobFromBase64(result.pdfBase64, result.contentType);
      downloadPdfBlob(blob, result.filename);
    },
    onError: (error) => {
      toast.error(error.message ?? "Не вдалося завантажити звіт");
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      icon={downloadMutation.isPending ? <Loader2 className="animate-spin" /> : <DownloadIcon />}
      disabled={!range.from || !range.to || downloadMutation.isPending}
      onClick={() => downloadMutation.mutate()}
    >
      Завантажити звіт
    </Button>
  );
};
