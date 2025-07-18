import { isUserAdmin } from "@/actions/isUserAdmin";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  if (!(await isUserAdmin())) {
    redirect("/unauthorized");
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Admin Panel! Manage settings and oversee operations from here.
        </p>

        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold text-gray-800">Admin Controls</h2>
          <p className="text-gray-600">Exclusive tools for admins will appear here soon.</p>
        </div>
      </div>
    </section>
  );
}