import nodemailer from "nodemailer";
import type { ReactElement } from "react";

import { env, isSmtpEnabled } from "@autolab/env/server";

import { EMAIL_LOGO_CID, emailLogoBuffer } from "./logo";
import { renderEmail } from "./render";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const createTransporter = () => {
  if (!isSmtpEnabled()) return null;

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    requireTLS: env.SMTP_PORT === 587,
    auth: {
      user: env.SMTP_USERNAME,
      pass: env.SMTP_PASSWORD,
    },
  });
};

const getSmtpAuthErrorMessage = () =>
  [
    "Gmail rejected SMTP credentials (535 BadCredentials).",
    "Use a Google App Password (not your regular Gmail password):",
    "https://myaccount.google.com/apppasswords",
    "Requires 2-Step Verification on the Google account.",
    `SMTP_USERNAME must match the account: ${env.SMTP_USERNAME ?? "(not set)"}`,
  ].join(" ");

export const sendEmail = async ({ to, subject, html, text }: SendEmailInput) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.info(`[email] SMTP not configured. Would send to ${to}: ${subject}\n${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM ?? env.SMTP_USERNAME,
      to,
      subject,
      html,
      text,
      attachments: [
        {
          filename: "autolab-icon.png",
          content: emailLogoBuffer,
          contentType: "image/png",
          cid: EMAIL_LOGO_CID,
        },
      ],
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EAUTH") {
      throw new Error(getSmtpAuthErrorMessage(), { cause: error });
    }

    throw error;
  }
};

export const sendTemplateEmail = async ({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: ReactElement;
}) => {
  const { html, text } = await renderEmail(template);
  await sendEmail({ to, subject, html, text });
};
