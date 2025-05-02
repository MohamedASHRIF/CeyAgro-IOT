'use client';

import { useState } from 'react';
import { SendNotificationForm } from './(components)/SendNotificationForm';
import NotificationCardList from './(components)/NotificationCardList';

export default function DashboardPage() {
  const [notificationUpdated, setNotificationUpdated] = useState(false);

  // This function will be passed to SendNotificationForm to trigger a refresh of notifications
  const handleNotificationSent = () => {
    setNotificationUpdated(!notificationUpdated); // Toggle the state to trigger re-fetch of notifications
  };

  return (
    <div className="p-6 space-y-10">
      {/* Send Notification */}
      <div className="max-w-4xl mx-auto">
        <SendNotificationForm onNotificationSent={handleNotificationSent} />
      </div>

      {/* Recent Notifications */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-semibold">Recent Notifications</h2>
        <NotificationCardList />
      </div>
    </div>
  );
}
