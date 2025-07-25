
"use client";

import React, { useState, useEffect } from "react";
import { DeviceTable } from "./(components)/DataTable";
import { DeviceHeader } from "./(components)/deviceHeader";
import { AddDeviceForm } from "./(components)/DeviceForm";
import { useUser } from "@auth0/nextjs-auth0/client";
//import DeviceAccessManager from "./(components)/deviceAccess";
function Page() {
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<string | null>("All Devices");

 useEffect(() => {
  const hash = window.location.hash;

  if (hash === "#add-device") {
    setActiveTab("Add New Device");
  } else if (hash === "#all-devices") {
    setActiveTab("All Access");
  } 
}, []);


  const renderTabComponent = () => {
    if (isLoading) return  (
      <div
        className="flex items-center justify-center h-screen"
        role="status"
        aria-label="Loading"
      >
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
       
      </div>
    );
  

    // Ensure user and email are available before rendering
    if (!user || !user.email) {
      return <p>User not authenticated or missing email.</p>;
    }

    switch (activeTab) {
  case "Add New Device":
    return <AddDeviceForm email={user.email} />;
  case "All Devices":
    return <DeviceTable userEmail={user.email} />;
 /* case "Device Access":
    return <DeviceAccessManager userEmail={user.email} />; */// <-- Add this line
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

