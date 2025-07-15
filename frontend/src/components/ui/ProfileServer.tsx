import { getSession } from "@auth0/nextjs-auth0";

export default async function ProfileServer() {
  const session = await getSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-100 shadow-sm text-center">
      <h2 className="text-xl font-semibold text-gray-900">
        Logged in as <span className="text-blue-600">{user.name}</span> 🎉
        <span>{user.role}</span>
      </h2>
      <p className="text-gray-700 mt-2">{user.email}</p>
    </div>
  );
}
