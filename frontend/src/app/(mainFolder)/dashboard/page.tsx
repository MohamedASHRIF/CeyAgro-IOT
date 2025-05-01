"use client";


import { AddButton } from "../(components)/Button";
import { PlusIcon } from "lucide-react";
import { SectionCards } from "./(components)/SectionCarrds";
import SnsSubscriptionPopup from "../(components)/SnsSubscriptionPopup";

export default function DashboardPage() {
  return (
    <>
      <div className="space-y-10 mt-4">
        <SectionCards />
        <div className="flex justify-center">
          <AddButton
            label="Add New Device"
            href="/devices/#add-new-device-tab"
            icon={<PlusIcon />}
          />
        </div>
      </div>
      <SnsSubscriptionPopup />
    </>
  );
}