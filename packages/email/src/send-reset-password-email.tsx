import { sendTemplateEmail } from "./lib/send";
import { ResetPasswordEmail } from "./templates/reset-password-email";

type SendResetPasswordEmailInput = {
  to: string;
  resetUrl: string;
  userName?: string;
};

export const sendResetPasswordEmail = async ({
  to,
  resetUrl,
  userName,
}: SendResetPasswordEmailInput) => {
  await sendTemplateEmail({
    to,
    subject: "Скидання пароля Autolab",
    template: <ResetPasswordEmail resetUrl={resetUrl} userName={userName} />,
  });
};
