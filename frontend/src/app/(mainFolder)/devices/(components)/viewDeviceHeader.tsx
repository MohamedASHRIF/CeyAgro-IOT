"use client";

import { FC } from "react";
import GreenHeader from "@/app/(mainFolder)/(components)/greenHeader";

interface DeviceHeaderProps {
  activeTab: string;
  deviceId: string;
}

export const DeviceHeader: FC<DeviceHeaderProps> = ({ activeTab, deviceId }) => {
  return (
    <GreenHeader
      title={`Device Management`}
      menuItems={[
        {
          name: "Device Information",
          onClick: () => {},
          isActive: activeTab === "Device Information",
        },
      ]}
    />
  );
};