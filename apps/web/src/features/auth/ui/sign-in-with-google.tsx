import { authClient } from "@/shared/lib/auth";

import { GoogleAuthButton } from "@/features/auth/ui/google-auth-button";

export const SignInWithGoogle = () => (
  <GoogleAuthButton
    label="Увійти через Google"
    size="lg"
    className="w-full"
    onClick={() =>
      authClient.signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      })
    }
  />
);
