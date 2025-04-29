// import { redirect } from 'next/navigation'

// export default function Page() {
//   redirect('/dashboard')
// }

"use client";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";


export default function Page() {
  const { user, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;

  if (user) {
    redirect("/dashboard");
  }
  // Redirect to login page
  redirect("/api/auth/login");
}
