// import { Card, CardContent } from "@/components/ui/card";

// const notifications = [
//   {
//     id: 1,
//     title: "System Maintenance",
//     message: "The system will undergo maintenance at midnight.",
//     date: "2025-04-22",
//   },
//   {
//     id: 2,
//     title: "New Feature Released",
//     message: "You can now generate reports in PDF format.",
//     date: "2025-04-21",
//   },
// ];

// export default function NotificationCardList() {
//   return (
//     <div className="space-y-4">
//       {notifications.map((notif) => (
//         <Card key={notif.id}>
//           <CardContent className="p-4">
//             <h3 className="text-lg font-medium">{notif.title}</h3>
//             <p className="text-sm text-muted-foreground">{notif.message}</p>
//             <p className="text-xs text-right text-gray-500 mt-2">
//               {notif.date}
//             </p>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Define the shape of a notification
interface Notification {
  _id: string;
  title: string;
  message: string;
  date: string;
}

const NotificationCardList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]); // Specify the type as Notification[]

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`,
      );
      const data: Notification[] = await response.json(); // Type the response data as an array of Notification
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    // Fetch notifications immediately after the component mounts
    fetchNotifications();

    // Poll every 5 seconds to get new notifications
    const intervalId = setInterval(fetchNotifications, 5000);

    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Sort notifications by date in descending order
  const sortedNotifications = notifications
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {sortedNotifications.map((notif) => (
        <Card
          key={notif._id}
          className="max-h-25 overflow-y-auto bg-[#FFD9666E] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-2xl pt-2 gap-2"
        >
          <CardContent className="p-4">
            <h3 className="text-lg font-medium">{notif.title}</h3>
            <p className="text-sm text-muted-foreground">{notif.message}</p>
            <p className="text-xs text-right text-gray-500 mt-2">
              {notif.date}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationCardList;
