// import { UserCardList } from "./(components)/UserCardList";

// export default function UserManagementPage() {
//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-3xl font-bold">User Management</h1>
//       <UserCardList />
//     </div>
//   );
// }
import UserCardList from './(components)/UserCardList';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

async function getUsers(): Promise<User[]> {
  const res = await fetch('http://localhost:3001/users', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }
  return await res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="p-6">
      <h1 className=" text-[#1c774d] text-4xl font-bold mb-6">All Users</h1>
      <UserCardList users={users} />
    </div>
  );
}
