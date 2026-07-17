export const getPasswordResetRedirectUrl = () => {
  if (typeof window === "undefined") {
    return "/auth/reset-password";
  }

  return `${window.location.origin}/auth/reset-password`;
};
