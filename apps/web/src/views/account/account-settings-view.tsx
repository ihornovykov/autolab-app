import { useQuery } from "@tanstack/react-query";
import { Building2, CarFront, Clock, Shield, User } from "lucide-react";

import { useSettingsTab } from "@/features/account/hooks/use-settings-tab";
import { AccountSettingsSkeleton } from "@/features/account/ui/account-settings-skeleton";
import { AccountTab } from "@/features/account/ui/account-tab";
import { OrganizationsTab } from "@/features/account/ui/organizations-tab";
import { ProfileTab } from "@/features/account/ui/profile-tab";
import { VehiclesTab } from "@/features/account/ui/vehicles-tab";
import { WorkingHoursTab } from "@/features/account/ui/working-hours-tab";
import { orpc } from "@/shared/api/orpc";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { Card } from "@autolab/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@autolab/ui/components/tabs";

const settingsTabs = [
  { id: "profile", label: "Профіль", icon: User },
  { id: "account", label: "Акаунт", icon: Shield },
  { id: "working-hours", label: "Робочий графік", icon: Clock },
  { id: "organizations", label: "Організації", icon: Building2 },
  { id: "vehicles", label: "Транспорт", icon: CarFront },
] as const;

const tabContentClassName = "mt-0 min-h-0 flex-1 overflow-y-auto";

export const AccountSettingsView = () => {
  const { activeTab, setActiveTab } = useSettingsTab();
  const profileQuery = useQuery(orpc.profile.getMyProfile.queryOptions());

  if (profileQuery.isPending) {
    return <AccountSettingsSkeleton />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
        <Heading title="Налаштування" />
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            {profileQuery.error?.message ?? "Не вдалося завантажити профіль."}
          </p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
      <Heading title="Налаштування" />
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        orientation="vertical"
        className="mt-2 flex min-h-0 flex-1 flex-col gap-2 lg:flex-row"
      >
        <div className="w-full max-w-[90vw] shrink-0 overflow-x-auto overflow-y-hidden lg:max-w-55">
          <TabsList className="flex h-auto max-w-55 flex-row justify-start gap-1 whitespace-nowrap rounded-none bg-transparent px-2 py-4 text-foreground lg:flex-col">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative max-w-55 shrink-0 justify-center px-4 py-2 after:absolute after:inset-y-0 after:inset-s-0 after:w-0.5 hover:bg-accent hover:text-foreground data-active:bg-transparent data-active:shadow-none data-active:after:bg-primary data-active:hover:bg-accent lg:w-full"
                >
                  <Icon className="mr-2" size={16} strokeWidth={2} aria-hidden="true" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg text-start">
          <TabsContent value="profile" className={tabContentClassName}>
            <ProfileTab profile={profileQuery.data} />
          </TabsContent>

          <TabsContent value="account" className={tabContentClassName}>
            <AccountTab email={profileQuery.data.email} hasPassword={profileQuery.data.hasPassword} />
          </TabsContent>

          <TabsContent value="working-hours" className={tabContentClassName}>
            <WorkingHoursTab />
          </TabsContent>

          <TabsContent value="organizations" className={tabContentClassName}>
            <OrganizationsTab />
          </TabsContent>

          <TabsContent value="vehicles" className={tabContentClassName}>
            <VehiclesTab />
          </TabsContent>
        </div>
      </Tabs>
    </PageContainer>
  );
};
