import { useMutation } from "@tanstack/react-query";
import { LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { client } from "@/shared/api/orpc";
import { Button } from "@autolab/ui/components/button";

type Props = {
  organizationId: string;
  bookingId: string;
};

export const CopyBookingLinkButton = ({ organizationId, bookingId }: Props) => {
  const copyMutation = useMutation({
    mutationFn: () => client.booking.createBookingShareToken({ organizationId, bookingId }),
    onSuccess: async ({ url }) => {
      await navigator.clipboard.writeText(url);
      toast.success("Посилання скопійовано");
    },
    onError: () => {
      toast.error("Не вдалося скопіювати посилання");
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      icon={copyMutation.isPending ? <Loader2 className="animate-spin" /> : <LinkIcon />}
      disabled={copyMutation.isPending}
      onClick={() => copyMutation.mutate()}
    >
      Копіювати посилання
    </Button>
  );
};
