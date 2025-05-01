'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserCardListProps {
  users: User[];
}

export default function UserCardList({ users }: UserCardListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const deleteUser = async (id: string) => {
    try {
      setLoadingId(id);
      await axios.delete(`http://localhost:3001/users/${id}`);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete user', error);
    } finally {
      setLoadingId(null);
    }
  };

  const makeAdmin = async (id: string) => {
    try {
      setLoadingId(id);
      await axios.patch(`http://localhost:3001/users/${id}/make-admin`);
      router.refresh();
    } catch (error) {
      console.error('Failed to make admin', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
      {users.map((user) => (
        <Card
          key={user._id}
          className="bg-gray-300 transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2"
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm mt-1">
              {user.role === 'admin' ? (
                <span className="text-green-600 font-semibold">Admin</span>
              ) : (
                <span className="text-gray-500">User</span>
              )}
            </p>
          </CardHeader>

          <CardContent>
            {/* Optional content here, like bio, joined date, etc */}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/users/${user._id}`)}
              className="w-full hover:bg-black/40 hover:text-white"
            >
              View Profile
            </Button>

            {user.role !== 'admin' && (
              <Button
                variant="outline"
                onClick={() => makeAdmin(user._id)}
                className=" w-full hover:bg-green-800 hover:text-white"
                disabled={loadingId === user._id}
              >
                {loadingId === user._id ? 'Making Admin...' : 'Make Admin'}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => deleteUser(user._id)}
              className=" bg-black/80 w-full  hover:bg-red-800 hover:text-white text-white font-semibold"
              disabled={loadingId === user._id}
            >
              {loadingId === user._id ? 'Deleting...' : 'Delete User'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
