import { Column, Img, Row, Section, Text } from "@react-email/components";

import { emailLogoPreviewSrc, getEmailLogoIconSrc } from "../lib/logo";

type Props = {
  iconSrc?: string;
};

export const EmailLogo = ({ iconSrc = getEmailLogoIconSrc() }: Props) => (
  <Section className="mb-8">
    <Row className="mx-auto w-auto">
      <Column className="w-[32px] pr-1 align-middle">
        <Img src={iconSrc} width={32} height={32} alt="" />
      </Column>
      <Column className="align-middle">
        <Text className="m-0 text-xl font-bold italic uppercase leading-none text-foreground">
          Autolab
        </Text>
      </Column>
    </Row>
  </Section>
);

EmailLogo.PreviewProps = {
  iconSrc: emailLogoPreviewSrc,
} satisfies Props;
