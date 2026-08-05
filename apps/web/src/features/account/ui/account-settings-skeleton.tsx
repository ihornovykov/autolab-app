import { range } from "@/shared/lib/arrays";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { Card } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";

export const AccountSettingsSkeleton = () => (
  <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
    <Heading title="Налаштування" />
    <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
      <div className="w-full shrink-0 lg:max-w-55">
        <div className="flex flex-row gap-2 px-2 py-4 lg:flex-col">
          {range(5).map((index) => (
            <Skeleton key={index} className="h-9 w-36 lg:w-full" />
          ))}
        </div>
      </div>

      <Card className="min-h-0 flex-1 p-6">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {range(5).map((index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </PageContainer>
);
