"use client";

import React, { useState, useEffect } from "react";
import { DeviceTable } from "./(components)/DataTable";
import { DeviceHeader } from "./(components)/deviceHeader";
import { AddDeviceForm } from "./(components)/DeviceForm";

function Page() {
  const [activeTab, setActiveTab] = useState<string | null>("All Devices");

  useEffect(() => {
    const hash = window.location.hash;

    if (hash === "#add-new-device-tab") {
      setActiveTab("Add New Device");
    } else  {
      setActiveTab("All Devices"); // Default to "View Devices"
    }
  }, []);

  const renderTabComponent = () => {
    switch (activeTab) {
      case "Add New Device":
        return <AddDeviceForm />;
      case "All Devices":
        return <DeviceTable />;
      default:
        return null;
    }
  };

  return (
    <>
      <DeviceHeader onTabChange={setActiveTab} activeTab={activeTab} />
      <div className="mt-4">{renderTabComponent()}</div>
    </>
  );
}

export default Page;
