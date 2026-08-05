import { parseAsStringLiteral, useQueryState } from "nuqs";

export const settingsTabIds = [
  "profile",
  "account",
  "working-hours",
  "organizations",
  "vehicles",
] as const;

export type SettingsTabId = (typeof settingsTabIds)[number];

const settingsTabParser = parseAsStringLiteral(settingsTabIds).withDefault("profile");

export const useSettingsTab = () => {
  const [activeTab, setActiveTab] = useQueryState("tab", settingsTabParser);

  return {
    activeTab,
    setActiveTab: (tab: SettingsTabId) => setActiveTab(tab),
  };
};

export const getSettingsTabUrl = (tab: SettingsTabId) =>
  `/dashboard/account/settings?tab=${tab}`;
