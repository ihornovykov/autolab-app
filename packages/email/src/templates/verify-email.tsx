import { Button, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

type Props = {
  verifyUrl: string;
  userName?: string;
};

export const VerifyEmail = ({ verifyUrl, userName }: Props) => {
  const greeting = userName ? `Вітаємо, ${userName}!` : "Вітаємо!";

  return (
    <EmailLayout
      preview="Підтвердіть email для облікового запису Autolab"
      title="Підтвердження email"
    >
      <Text className="m-0 mb-4 text-sm leading-6 text-foreground">{greeting}</Text>
      <Text className="m-0 mb-6 text-sm leading-6 text-muted-foreground">
        Дякуємо за реєстрацію в Autolab. Підтвердіть вашу email-адресу, щоб активувати обліковий
        запис і почати роботу з CRM.
      </Text>
      <Button
        href={verifyUrl}
        className="box-border rounded-md bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground no-underline"
      >
        Підтвердити email
      </Button>
      <Text className="m-0 mt-6 text-xs leading-5 text-muted-foreground">
        Якщо кнопка не працює, скопіюйте це посилання у браузер:
      </Text>
      <Text className="m-0 mt-2 break-all text-xs leading-5 text-primary">{verifyUrl}</Text>
    </EmailLayout>
  );
};

VerifyEmail.PreviewProps = {
  verifyUrl: "https://autolab.local/auth/verify-email?token=preview",
  userName: "Ігор",
};

export default VerifyEmail;
