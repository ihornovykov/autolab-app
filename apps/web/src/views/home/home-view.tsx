import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { UserMenu } from "@/features/auth/ui/user-menu";
import { orpc } from "@/shared/api/orpc";
import { Button } from "@autolab/ui/components/button";

export const HomeView = () => {
  const healthCheck = useQuery(orpc.health.healthCheck.queryOptions());

  return (
    <div className="min-h-svh bg-canvas">
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <p className="font-heading text-lg font-semibold">Autolab</p>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="outline">Увійти</Button>
          </Link>
          <UserMenu />
        </div>
      </header>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-heading text-3xl font-semibold">Autolab</h1>
        <section className="mt-8 rounded-lg border bg-background p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${healthCheck.data ? "bg-status-success" : "bg-status-danger"}`}
            />
            <span className="text-sm text-muted-foreground">
              {healthCheck.isLoading
                ? "Перевірка..."
                : healthCheck.data
                  ? "Підключено"
                  : "Немає зʼєднання"}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};
