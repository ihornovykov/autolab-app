import { ProfileWorkingHoursForm } from "@/features/account/ui/profile-working-hours-form";
import { Card } from "@autolab/ui/components/card";

export const WorkingHoursTab = () => (
  <Card className="p-6">
    <div className="mb-6">
      <h2 className="text-xl font-semibold">Робочий графік</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Вкажіть години, коли ви доступні для записів. Робота поза цим часом переноситься на
        наступний робочий день.
      </p>
    </div>

    <div className="max-w-4xl">
      <ProfileWorkingHoursForm />
    </div>
  </Card>
);
