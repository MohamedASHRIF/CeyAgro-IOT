"use client";

import { ProfileHeader } from "../(components)/profileHeader";
import ProfilePage from "../(components)/profilePage"; 

export default function ProfileManagementPage() {
  return (
    <div className="profile-management-page">
      {/*  activeTab prop to "Personal Information" */}
      <ProfileHeader activeTab="Personal Information" />

      {/*  show the profile details */}
      <div className="mt-4">
        <ProfilePage />
      </div>
    </div>
  );
}
