export const emailColors = {
  background: "#fafafa",
  foreground: "#1a1a1a",
  card: "#ffffff",
  primary: "#f6460f",
  primaryForeground: "#ffffff",
  secondary: "#f7f0ed",
  secondaryForeground: "#1a1a1a",
  muted: "#f5f4f4",
  mutedForeground: "#737373",
  border: "#e8e8ea",
  accent: "#f7f0ed",
} as const;

export const emailTailwindConfig = {
  theme: {
    extend: {
      colors: {
        background: emailColors.background,
        foreground: emailColors.foreground,
        card: emailColors.card,
        primary: {
          DEFAULT: emailColors.primary,
          foreground: emailColors.primaryForeground,
        },
        secondary: {
          DEFAULT: emailColors.secondary,
          foreground: emailColors.secondaryForeground,
        },
        muted: {
          DEFAULT: emailColors.muted,
          foreground: emailColors.mutedForeground,
        },
        border: emailColors.border,
        accent: emailColors.accent,
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      fontFamily: {
        sans: ["Geist", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
};
