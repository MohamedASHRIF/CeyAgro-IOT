// "use client";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Trash2 } from "lucide-react";
// import { useState } from "react";

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   userId: string;
//   timestamp: string;
// }

// interface NotificationBoxProps {
//   notification: Notification;
//   onDelete?: (id: string) => void;
// }

// export const NotificationBox: React.FC<NotificationBoxProps> = ({
//   notification,
//   onDelete,
// }) => {
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleDelete = async () => {
//     if (isDeleting) return;

//     setIsDeleting(true);
//     try {
//       console.log("Deleting notification:", notification.id);
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notification.id}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to delete notification: ${response.status}`);
//       }

//       console.log("Notification deleted successfully:", notification.id);

//       // Call parent callback for optimistic update
//       if (onDelete) {
//         onDelete(notification.id);
//       }
//     } catch (error) {
//       console.error("Error deleting notification:", error);
//       // You might want to show an error message to the user here
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const formatTimestamp = (timestamp: string) => {
//     try {
//       return new Date(timestamp).toLocaleString();
//     } catch (error) {
//       return timestamp;
//     }
//   };

//   return (
//     <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle className="text-lg font-medium">
//           {notification.title}
//         </CardTitle>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={handleDelete}
//           disabled={isDeleting}
//           className="text-gray-500 hover:text-red-500 disabled:opacity-50"
//         >
//           <Trash2 className="h-4 w-4" />
//           <span className="ml-2 hidden sm:inline">
//             {isDeleting ? "Deleting..." : "Mark as Read"}
//           </span>
//         </Button>
//       </CardHeader>
//       <CardContent>
//         <p className="text-sm text-gray-600">{notification.message}</p>
//         <p className="text-xs text-gray-400 mt-2">
//           {formatTimestamp(notification.timestamp)}
//         </p>
//       </CardContent>
//     </Card>
//   );
// };

"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Check } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  timestamp: string;
  read: boolean;
}

interface NotificationBoxProps {
  notification: Notification;
  onDelete?: (id: string) => void;
  onRead?: (id: string) => void;
}

export const NotificationBox: React.FC<NotificationBoxProps> = ({
  notification,
  onDelete,
  onRead,
}) => {
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const handleMarkAsRead = async () => {
    if (isMarkingRead || notification.read) return;

    setIsMarkingRead(true);
    try {
      console.log("Marking notification as read:", notification.id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark notification as read: ${response.status}`
        );
      }

      console.log("Notification marked as read:", notification.id);

      if (onRead) {
        onRead(notification.id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting notification:", notification.id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notification.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }

      console.log("Notification deleted successfully:", notification.id);

      if (onDelete) {
        onDelete(notification.id);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  return (
    <Card
      className={`mb-4 shadow-sm hover:shadow-md transition-shadow ${
        notification.read
          ? "bg-gray-100 border-gray-300"
          : "bg-white border-teal-200"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">
          {notification.title}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsRead}
            disabled={isMarkingRead || notification.read}
            className="text-gray-500 hover:text-teal-500 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">
              {isMarkingRead ? "Marking..." : "Mark as Read"}
            </span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this notification? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-2">
          {formatTimestamp(notification.timestamp)}
        </p>
      </CardContent>
    </Card>
  );
};
