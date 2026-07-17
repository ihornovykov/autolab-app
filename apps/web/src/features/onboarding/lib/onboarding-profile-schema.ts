import z from "zod";

export const onboardingProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Ім'я є обов'язковим"),
  lastName: z.string().trim().min(1, "Прізвище є обов'язковим"),
  middleName: z.string(),
  phone: z.string().trim().min(10, "Телефон має містити щонайменше 10 символів"),
});

export type OnboardingProfileValues = z.infer<typeof onboardingProfileSchema>;

export const splitFullName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};
