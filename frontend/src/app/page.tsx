// "use client";
// import { redirect } from "next/navigation";
// import { useUser } from "@auth0/nextjs-auth0/client";

// export default function Page() {
//   const { user, isLoading } = useUser();
//   if (isLoading)
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="w-12 h-12 border-4 border-[hsl(172.5,_66%,_50.4%)]  border-t-transparent rounded-full animate-spin" />
//       </div>
//     );//loading spin

//   if (user) {
//     redirect("/dashboard");
//   }
//   // Redirect to login page
//   redirect("/api/auth/login");
// }

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Page() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  // Explicitly type loginError as string | null
  const [loginError, setLoginError] = useState<string | null>(null);

  // Handle redirects and errors in useEffect
  useEffect(() => {
    if (error) {
      setLoginError("Failed to process login. Please try again.");
      console.error("Auth0 error:", error);
      return;
    }

    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        // Attempt to redirect to Auth0 login
        router.push("/api/auth/login");
      }
    }
  }, [isLoading, user, error, router]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">

        <div className="w-12 h-12 border-4 border-teal-400  border-t-transparent rounded-full animate-spin" />
      </div>
    ); //loading spin

     

  // Render error state
  if (loginError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{loginError}</div>
      </div>
    );
  }

  // Return null while redirecting
  return null;
}
