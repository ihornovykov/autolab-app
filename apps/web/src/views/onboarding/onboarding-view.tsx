import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/shared/lib/auth-client";
import { splitFullName } from "@/features/onboarding/lib/onboarding-profile-schema";
import { OnboardingProfileForm } from "@/features/onboarding/ui/onboarding-profile-form";
import {
  OnboardingStepIndicator,
  type OnboardingStep,
} from "@/features/onboarding/ui/onboarding-step-indicator";
import { OnboardingWorkingHoursForm } from "@/features/onboarding/ui/onboarding-working-hours-form";
import { CreateOrganizationForm } from "@/features/organization/ui/create-organization-form";
import { orpc } from "@/shared/api/orpc";
import { useOrganizationStore } from "@/shared/stores/organization";
import { AuthPageShell } from "@/views/auth/auth-page-shell";
import { Button } from "@autolab/ui/components/button";

const ORGANIZATION_FORM_ID = "onboarding-organization-form";

const getInitialStep = (isProfileComplete?: boolean): OnboardingStep =>
  isProfileComplete ? "working-hours" : "profile";

export const OnboardingView = () => {
  const navigate = useNavigate({ from: "/onboarding" });
  const queryClient = useQueryClient();
  const setSelectedOrganizationId = useOrganizationStore(
    (state) => state.setSelectedOrganizationId,
  );
  const { data: session } = authClient.useSession();

  const onboardingStatusQuery = useQuery(orpc.profile.getOnboardingStatus.queryOptions());
  const profileQuery = useQuery(orpc.profile.getMyProfile.queryOptions());
  const workingHoursQuery = useQuery(orpc.profile.getMyWorkingHours.queryOptions());

  const [step, setStep] = useState<OnboardingStep>("profile");

  useEffect(() => {
    if (!onboardingStatusQuery.data) return;
    setStep(getInitialStep(onboardingStatusQuery.data.isProfileComplete));
  }, [onboardingStatusQuery.data]);

  const profileInitialValues = useMemo(() => {
    const profile = profileQuery.data;
    const splitName = splitFullName(session?.user.name ?? "");

    return {
      firstName: profile?.firstName ?? splitName.firstName,
      lastName: profile?.lastName ?? splitName.lastName,
      middleName: profile?.middleName ?? "",
      phone: profile?.phone ?? "",
    };
  }, [profileQuery.data, session?.user.name]);

  const createOrganizationMutation = useMutation(
    orpc.organization.createOrganization.mutationOptions({
      onSuccess: async (organization) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: orpc.organization.key() }),
          queryClient.invalidateQueries({ queryKey: orpc.profile.getOnboardingStatus.key() }),
        ]);
        setSelectedOrganizationId(organization.id);
        toast.success("Ласкаво просимо до Autolab!");
        navigate({
          to: "/dashboard",
          search: { organizationId: organization.id },
        });
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося створити організацію");
      },
    }),
  );

  if (
    onboardingStatusQuery.isLoading ||
    profileQuery.isLoading ||
    workingHoursQuery.isLoading
  ) {
    return (
      <AuthPageShell contentClassName="max-w-2xl" contentAlign="start">
        <p className="text-center text-sm text-muted-foreground">Завантаження...</p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell contentClassName="max-w-2xl" contentAlign="start">
      <div className="space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Налаштування акаунту</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Заповніть профіль, налаштуйте графік роботи та створіть організацію
          </p>
        </div>

        <OnboardingStepIndicator currentStep={step} />

        {step === "profile" ? (
          <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
            <OnboardingProfileForm
              initialValues={profileInitialValues}
              onCompleted={() => setStep("working-hours")}
            />
          </div>
        ) : null}

        {step === "working-hours" ? (
          <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-semibold">Графік роботи</h2>
              <p className="text-sm text-muted-foreground">
                Вкажіть години, коли ви доступні для записів. Робота поза цим часом
                переноситься на наступний робочий день.
              </p>
            </div>
            <OnboardingWorkingHoursForm
              initialDays={workingHoursQuery.data}
              onCompleted={() => setStep("organization")}
            />
            <div className="mt-6">
              <Button type="button" variant="outline" onClick={() => setStep("profile")}>
                Назад
              </Button>
            </div>
          </div>
        ) : null}

        {step === "organization" ? (
          <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-semibold">Створіть організацію</h2>
              <p className="text-sm text-muted-foreground">
                Додайте СТО або автосервіс, яким ви керуватимете в системі
              </p>
            </div>
            <CreateOrganizationForm
              formId={ORGANIZATION_FORM_ID}
              onSubmit={(values) => createOrganizationMutation.mutate(values)}
            />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setStep("working-hours")}>
                Назад
              </Button>
              <Button
                type="submit"
                form={ORGANIZATION_FORM_ID}
                loading={createOrganizationMutation.isPending}
              >
                Завершити налаштування
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </AuthPageShell>
  );
};
