import { Button } from "@autolab/ui/components/button";

import { authClient } from "@/shared/lib/auth";

export const SignInWithGoogle = () => (
  <Button
    size="lg"
    variant="outline"
    className="w-full"
    onClick={() =>
      authClient.signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      })
    }
  >
    <img src="/icons/google.svg" alt="Google" className="size-4" width={16} height={16} />
    Увійти через Google
  </Button>
);
