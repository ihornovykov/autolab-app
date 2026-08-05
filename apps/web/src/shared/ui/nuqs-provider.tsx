"use client";

import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

type Props = {
  children: React.ReactNode;
};

export const NuqsProvider = ({ children }: Props) => <NuqsAdapter>{children}</NuqsAdapter>;
