import type { LucideIcon } from "lucide-react";
import {
  Building2Icon,
  CalendarDaysIcon,
  CarIcon,
  UserIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

import type { SearchResultType } from "@/features/search/lib/types";

export const SEARCH_RESULT_TYPE_LABELS: Record<SearchResultType, string> = {
  organization: "Організація",
  employee: "Працівник",
  client: "Клієнт",
  vehicle: "Авто",
  service: "Послуга",
  booking: "Запис",
};

export const SEARCH_RESULT_TYPE_ICONS: Record<SearchResultType, LucideIcon> = {
  organization: Building2Icon,
  employee: UsersIcon,
  client: UserIcon,
  vehicle: CarIcon,
  service: WrenchIcon,
  booking: CalendarDaysIcon,
};
