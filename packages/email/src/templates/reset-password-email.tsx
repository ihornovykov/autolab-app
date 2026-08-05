import { Button, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

type Props = {
  resetUrl: string;
  userName?: string;
};

export const ResetPasswordEmail = ({ resetUrl, userName }: Props) => {
  const greeting = userName ? `Вітаємо, ${userName}!` : "Вітаємо!";

  return (
    <EmailLayout
      preview="Скидання пароля до вашого облікового запису Autolab"
      title="Скидання пароля"
    >
      <Text className="m-0 mb-4 text-sm leading-6 text-foreground">{greeting}</Text>
      <Text className="m-0 mb-6 text-sm leading-6 text-muted-foreground">
        Ми отримали запит на скидання пароля. Натисніть кнопку нижче, щоб створити новий пароль.
        Посилання дійсне обмежений час.
      </Text>
      <Button
        href={resetUrl}
        className="box-border rounded-md bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground no-underline"
      >
        Створити новий пароль
      </Button>
      <Text className="m-0 mt-6 text-xs leading-5 text-muted-foreground">
        Якщо кнопка не працює, скопіюйте це посилання у браузер:
      </Text>
      <Text className="m-0 mt-2 break-all text-xs leading-5 text-primary">{resetUrl}</Text>
    </EmailLayout>
  );
};

ResetPasswordEmail.PreviewProps = {
  resetUrl: "https://autolab.local/auth/reset-password?token=preview",
  userName: "Ігор",
};

export default ResetPasswordEmail;
