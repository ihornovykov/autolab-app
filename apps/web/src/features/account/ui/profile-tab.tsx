import { ProfileForm } from "@/features/account/ui/profile-form";
import { Card } from "@autolab/ui/components/card";

type Profile = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  phone?: string | null;
  email: string;
  hasPassword: boolean;
};

type Props = {
  profile: Profile;
};

export const ProfileTab = ({ profile }: Props) => (
  <Card className="p-6">
    <div className="mb-6">
      <h2 className="text-xl font-semibold">Профіль</h2>
      <p className="mt-1 text-sm text-muted-foreground">Особисті дані та контакти</p>
    </div>

    <ProfileForm profile={profile} />
  </Card>
);
