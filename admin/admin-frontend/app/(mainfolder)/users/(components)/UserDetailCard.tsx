// "use client";

// interface UserDetailCardProps {
//   userId: string;
// }

// interface User {
//   name: string;
//   id: string;
//   email: string;
// }

// // ✅ Fix: Add explicit type for the object
// const fakeUserData: Record<string, User> = {
//   "1": { name: "Navod", id: "1", email: "navod@example.com" },
//   "2": { name: "Thavishi", id: "2", email: "thavi@example.com" },
// };

// export function UserDetailCard({ userId }: UserDetailCardProps) {
//   const user = fakeUserData[userId]; // ✅ No more error

//   if (!user) {
//     return <p>User not found</p>;
//   }

//   return (
//     <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-xl mx-auto space-y-4">
//       <h2 className="text-xl font-semibold">Name: {user.name}</h2>
//       <p>
//         <strong>ID:</strong> {user.id}
//       </p>
//       <p>
//         <strong>Email:</strong> {user.email}
//       </p>
//     </div>
//   );
// }
'use client';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserDetailCardProps {
  user: User;
}

export function UserDetailCard({ user }: UserDetailCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">{user.name}</h2>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>
    </div>
  );
}
