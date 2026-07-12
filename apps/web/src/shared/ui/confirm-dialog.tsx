import { CircleAlertIcon } from "lucide-react";
import { useState } from "react";

import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";

type Props = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
};

export const ConfirmDialog = ({
  title,
  description,
  confirmLabel = "Підтвердити",
  cancelLabel = "Скасувати",
  variant = "default",
  onConfirm,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      dialogs.close();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      className="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={isLoading}
            onClick={() => dialogs.close()}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="default"
            loading={isLoading}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full border"
          aria-hidden="true"
        >
          <CircleAlertIcon className="size-4 opacity-80" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Dialog>
  );
};
