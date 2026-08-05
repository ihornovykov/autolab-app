import { Column, Img, Row, Section, Text } from "@react-email/components";

import { autolabLogoDataUri } from "../lib/logo";

export const EmailLogo = () => (
  <Section className="mb-8">
    <Row className="mx-auto w-auto">
      <Column className="w-[32px] pr-1 align-middle">
        <Img src={autolabLogoDataUri} width={32} height={32} alt="" />
      </Column>
      <Column className="align-middle">
        <Text className="m-0 text-xl font-bold italic uppercase leading-none text-foreground">
          Autolab
        </Text>
      </Column>
    </Row>
  </Section>
);
