import { CalendarIcon } from "lucide-react";

import { EmptyState } from "@/shared/ui/empty-state";
import { Heading, PageContainer } from "@/shared/ui/page-container";

export const CalendarPlaceholderView = () => (
  <PageContainer>
    <Heading title="Календар" />
    <EmptyState
      icon={CalendarIcon}
      title="Календар у наступній фазі"
      description="Backend для записів уже готовий — UI календаря зʼявиться у Phase 2."
    />
  </PageContainer>
);
