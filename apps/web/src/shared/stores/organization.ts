import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OrganizationStore = {
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (organizationId: string | null) => void;
};

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      selectedOrganizationId: null,
      setSelectedOrganizationId: (organizationId) =>
        set({ selectedOrganizationId: organizationId }),
    }),
    {
      name: "organization/v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
