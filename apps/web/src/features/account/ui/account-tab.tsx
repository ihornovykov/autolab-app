import { ChangePasswordForm } from "@/features/account/ui/change-password-form";
import { ConnectedAccountsSection } from "@/features/account/ui/connected-accounts-section";
import { Card } from "@autolab/ui/components/card";

type Props = {
  email: string;
  hasPassword: boolean;
};

export const AccountTab = ({ email, hasPassword }: Props) => (
  <Card className="p-6">
    <div className="mb-6">
      <h2 className="text-xl font-semibold">Акаунт</h2>
      <p className="mt-1 text-sm text-muted-foreground">Способи входу та безпека</p>
    </div>

    <div className="max-w-4xl space-y-8">
      <ConnectedAccountsSection email={email} hasPassword={hasPassword} />
      {hasPassword ? <ChangePasswordForm /> : null}
    </div>
  </Card>
);
