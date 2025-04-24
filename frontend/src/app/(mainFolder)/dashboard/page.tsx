"use client";

import { useState } from "react";
import { DashboardHeader } from "./(components)/dashboardHeader";
import { AddButton } from "../(components)/Button";
import { PlusIcon } from "lucide-react";
import { SectionCards } from "./(components)/SectionCarrds"; 

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const renderTabComponent = () => {
    switch (activeTab) {
      case "Active Devices":
        return <div>Active devices list will display here</div>;
      case "Inactive Devices":
        return <div>Inactive Devices list will display here</div>;
      case "View All Devices":
        return <div>All Devices will display here</div>;
      default:
        return (
          <div className="space-y-10">
            <SectionCards />
            <div className="flex justify-center">
              <AddButton
                label="Add New Device"
                href="/devices/#add-new-device-tab"
                icon={<PlusIcon />}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-4">{renderTabComponent()}</div>
    </>
  );
}
