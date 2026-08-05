import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  connectedAccountsQueryKey,
  useConnectedAccounts,
} from "@/features/account/hooks/use-connected-accounts";
import { getSettingsTabUrl } from "@/features/account/hooks/use-settings-tab";
import { LinkEmailAccountDialog } from "@/features/account/ui/link-email-account-dialog";
import { GoogleAuthButton } from "@/features/auth/ui/google-auth-button";
import { authClient } from "@/shared/lib/auth";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { dialogs } from "@/shared/stores/dialogs";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Skeleton } from "@autolab/ui/components/skeleton";

type Props = {
  email: string;
  hasPassword: boolean;
};

const settingsCallbackUrl = getSettingsTabUrl("account");

export const ConnectedAccountsSection = ({ email, hasPassword }: Props) => {
  const queryClient = useQueryClient();
  const accountsQuery = useConnectedAccounts();
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  const unlinkGoogleMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.unlinkAccount({ providerId: "google" });

      if (error) throw new Error(error.message ?? "Не вдалося відключити Google");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: connectedAccountsQueryKey });
      toast.success("Google відключено");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const hasGoogleAccount = accountsQuery.data?.some((account) => account.providerId === "google");
  const canUnlinkGoogle = hasGoogleAccount && hasPassword;

  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);

    try {
      await authClient.linkSocial({
        provider: "google",
        callbackURL: settingsCallbackUrl,
      });
    } catch (error) {
      setIsLinkingGoogle(false);
      toast.error(error instanceof Error ? error.message : "Не вдалося підключити Google");
    }
  };

  const handleUnlinkGoogle = () => {
    dialogs.open(
      <ConfirmDialog
        title="Відключити Google"
        description="Ви більше не зможете входити через Google, доки не підключите акаунт знову."
        confirmLabel="Відключити"
        variant="destructive"
        onConfirm={async () => {
          await unlinkGoogleMutation.mutateAsync();
        }}
      />,
    );
  };

  const handleLinkEmail = () => {
    dialogs.open(<LinkEmailAccountDialog email={email} />);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Способи входу</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Керуйте способами входу до вашого акаунта
        </p>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/40">
              <MailIcon className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Email і пароль</p>
              <p className="text-sm text-muted-foreground">Вхід за email та паролем</p>
            </div>
          </div>

          {accountsQuery.isLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : hasPassword ? (
            <Badge variant="secondary">Підключено</Badge>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={handleLinkEmail}>
              Підключити
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/40">
              <img src="/icons/google.svg" alt="" className="size-4" width={16} height={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Google</p>
              <p className="text-sm text-muted-foreground">Вхід через Google акаунт</p>
            </div>
          </div>

          {accountsQuery.isLoading ? (
            <Skeleton className="h-9 w-36" />
          ) : hasGoogleAccount ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Підключено</Badge>
              {canUnlinkGoogle ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={unlinkGoogleMutation.isPending}
                  onClick={handleUnlinkGoogle}
                >
                  Відключити
                </Button>
              ) : null}
            </div>
          ) : (
            <GoogleAuthButton
              label="Підключити Google"
              loading={isLinkingGoogle}
              onClick={handleLinkGoogle}
            />
          )}
        </div>
      </div>
    </div>
  );
};
