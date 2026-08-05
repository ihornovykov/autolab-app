import { sendTemplateEmail } from "./lib/send";
import { VerifyEmail } from "./templates/verify-email";

type SendVerificationEmailInput = {
  to: string;
  verifyUrl: string;
  userName?: string;
};

export const sendVerificationEmail = async ({
  to,
  verifyUrl,
  userName,
}: SendVerificationEmailInput) => {
  await sendTemplateEmail({
    to,
    subject: "Підтвердження email Autolab",
    template: <VerifyEmail verifyUrl={verifyUrl} userName={userName} />,
  });
};
