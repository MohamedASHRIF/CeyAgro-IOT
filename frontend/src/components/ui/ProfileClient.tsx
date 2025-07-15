"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function ProfileClient() {
  const { user, isLoading, error } = useUser();

  if (isLoading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{String(error)}</div>;

  return (
    user && (
      <div className="mt-6 flex flex-col items-center p-6 border border-gray-300 rounded-lg bg-gray-50 shadow-md">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name || "User Profile Photo"}
            className="w-24 h-24 rounded-full shadow-sm"
          />
        )}

        <h2 className="text-xl font-semibold text-gray-900 mt-4">{user.name}</h2>
        <p className="text-gray-700">{user.email}</p>
      </div>
    )
  );
}