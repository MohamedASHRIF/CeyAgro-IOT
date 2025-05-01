import { NotificationList } from "./(components)/NotificationList";

export default function NotificationPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-medium mb-6 ">Notifications</h1>
      <NotificationList />
    </div>
  );
}
