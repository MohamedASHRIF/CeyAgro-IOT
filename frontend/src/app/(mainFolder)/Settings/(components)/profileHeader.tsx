"use client";

import { FC } from "react";
import GreenHeader from "@/app/(mainFolder)/(components)/greenHeader";

interface ProfileHeaderProps {
  activeTab: string | null;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({ activeTab }) => (
  <GreenHeader
    title="Profile Management"
    menuItems={[
      {
        name: "Personal Information",
        onClick: () => {},
        isActive: activeTab === "Personal Information",
      },
    ]}
  />
);
