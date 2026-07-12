import { Button } from "@autolab/ui/components/button";
import { Building2, PlusIcon } from "lucide-react";

import { CreateOrganizationDialog } from "@/features/organization/ui/create-organization-dialog";
import { dialogs } from "@/shared/stores/dialogs";

export const EmptyOrganizationsState = () => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="mb-6 flex size-24 items-center justify-center rounded-lg bg-muted">
      <Building2 className="size-12 text-muted-foreground" />
    </div>
    <h3 className="mb-2 text-2xl font-semibold">Немає організацій</h3>
    <p className="mb-6 text-muted-foreground">
      Ви ще не створили жодної організації. Почніть з створення вашої першої організації.
    </p>
    <Button icon={<PlusIcon />} onClick={() => dialogs.open(<CreateOrganizationDialog />)}>
      Створити організацію
    </Button>
  </div>
);
