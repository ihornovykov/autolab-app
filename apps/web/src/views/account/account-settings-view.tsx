import { useQuery } from "@tanstack/react-query";
import { Building2, CarFront, User } from "lucide-react";
import { useState } from "react";

import { OrganizationsTab } from "@/features/account/ui/organizations-tab";
import { VehiclesTab } from "@/features/account/ui/vehicles-tab";
import { ProfileForm } from "@/features/account/ui/profile-form";
import { orpc } from "@/shared/api/orpc";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { Card } from "@autolab/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@autolab/ui/components/tabs";

const settingsTabs = [
  { id: "profile", label: "Профіль", icon: User },
  { id: "organizations", label: "Організації", icon: Building2 },
  { id: "vehicles", label: "Транспорт", icon: CarFront },
] as const;

const tabContentClassName = "mt-0 min-h-0 flex-1 overflow-y-auto";

export const AccountSettingsView = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const profileQuery = useQuery(orpc.profile.getMyProfile.queryOptions());

  if (!profileQuery.data) {
    return (
      <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
        <Heading title="Налаштування" />
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Не вдалося завантажити профіль.</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
      <Heading title="Налаштування" />
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(String(value))}
        orientation="vertical"
        className="mt-2 flex min-h-0 flex-1 flex-col gap-2 lg:flex-row"
      >
        <div className="w-full max-w-[90vw] shrink-0 overflow-x-auto overflow-y-hidden lg:max-w-[200px]">
          <TabsList className="flex h-auto max-w-[200px] flex-row justify-start gap-1 whitespace-nowrap rounded-none bg-transparent px-2 py-4 text-foreground lg:flex-col">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative max-w-[200px] shrink-0 justify-center px-4 py-2 after:absolute after:inset-y-0 after:start-0 after:w-0.5 hover:bg-accent hover:text-foreground data-active:bg-transparent data-active:shadow-none data-active:after:bg-primary data-active:hover:bg-accent lg:w-full"
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
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Профіль</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Особисті дані, дані для входу та зміна пароля
                </p>
              </div>
              <ProfileForm profile={profileQuery.data} />
            </Card>
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
