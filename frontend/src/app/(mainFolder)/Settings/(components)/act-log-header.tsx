"use client";

import { FC } from "react";
import GreenHeader from "@/app/(mainFolder)/(components)/greenHeader";

interface ActLogHeaderProps {
  activeTab: string | null;
}

export const ActLogHeader: FC<ActLogHeaderProps> = ({ activeTab }) => (
  <GreenHeader
    title="Activity Log"
    menuItems={[
      {
        name: "Activity Log",
        onClick: () => {},
        isActive: activeTab === "Activity Log",
      },
    ]}
  />
);
