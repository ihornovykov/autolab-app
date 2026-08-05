import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ComponentProps } from "react";

import { emailTailwindConfig } from "../lib/theme";
import { EmailLogo } from "./email-logo";

type Props = {
  preview: string;
  title: string;
  children: ComponentProps<typeof Section>["children"];
};

export const EmailLayout = ({ preview, title, children }: Props) => (
  <Html lang="uk">
    <Head />
    <Preview>{preview}</Preview>
    <Tailwind config={emailTailwindConfig}>
      <Body className="bg-background m-0 py-10 font-sans">
        <Container className="mx-auto max-w-[520px] px-4">
          <EmailLogo />

          <Section className="rounded-lg border border-border bg-card px-8 py-8 shadow-sm">
            <Heading className="m-0 mb-4 text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </Heading>
            {children}
          </Section>

          <Hr className="my-8 border-border" />

          <Text className="m-0 text-center text-xs leading-5 text-muted-foreground">
            © {new Date().getFullYear()} Autolab. CRM для автосервісів.
          </Text>
          <Text className="m-0 mt-2 text-center text-xs leading-5 text-muted-foreground">
            Якщо ви не очікували цього листа, просто проігноруйте його.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
