// import { redirect } from 'next/navigation'

// export default function Page() {
//   redirect('/dashboard')
// }

"use client";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Page() {
  const { user, isLoading } = useUser();
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );//loading spin

  if (user) {
    redirect("/dashboard");
  }
  // Redirect to login page
  redirect("/api/auth/login");
}
