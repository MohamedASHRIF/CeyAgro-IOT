"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  timestamp: string;
}

interface NotificationBoxProps {
  notification: Notification;
}

export const NotificationBox: React.FC<NotificationBoxProps> = ({
  notification,
}) => {
  // NotificationBox.tsx
  const handleDelete = async () => {
    try {
      console.log("Sending DELETE request for notification:", notification.id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notification.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to delete notification. Status: ${response.status}`
        );
      }
      console.log("Notification deleted successfully:", notification.id);
      // State update is handled in NotificationList via WebSocket
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">
          {notification.title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-gray-500 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Mark as Read</span>
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-2">{notification.timestamp}</p>
      </CardContent>
    </Card>
  );
};
