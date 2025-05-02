// import { UserDetailCard } from "../(components)/UserDetailCard";

// export default function UserDetailPage({ params }: { params: { id: string } }) {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">User Details</h1>
//       <UserDetailCard userId={params.id} />
//     </div>
//   );
// }
// import { notFound } from "next/navigation";

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// async function getUser(id: string): Promise<User | null> {
//   try {
//     const res = await fetch(`http://localhost:3001/users/${id}`);
//     if (!res.ok) {
//       throw new Error("User not found");
//     }
//     return await res.json(); // <-- Important: await here
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }

// export default async function UserPage({ params }: { params: { id: string } }) {
//   const user = await getUser(params.id);

//   if (!user) {
//     notFound();
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">User Profile</h1>
//       <div className="bg-white shadow rounded-lg p-6">
//         <p>
//           <strong>Name:</strong> {user.name}
//         </p>
//         <p>
//           <strong>Email:</strong> {user.email}
//         </p>
//         <p>
//           <strong>Role:</strong> {user.role}
//         </p>
//       </div>
//     </div>
//   );
// }
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic'; // <-- Add this line at top!

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

async function getUser(id: string): Promise<User | null> {
  try {
    const res = await fetch(`http://localhost:3001/users/${id}`);

    if (!res.ok) {
      throw new Error('User not found');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="p-4">
      <h1 className=" text-green-500 text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-gray-300 shadow rounded-lg p-6">
        <h2>
          <strong>Name:</strong> {user.name}
        </h2>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
    </div>
  );
}
