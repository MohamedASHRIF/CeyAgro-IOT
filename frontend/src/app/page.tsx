// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useUser, UserContext } from "@auth0/nextjs-auth0/client";

// export default function Page() {
//   const { user, isLoading, error }: UserContext = useUser();
//   const router = useRouter();
//   const [loginError, setLoginError] = useState<string | null>(null);
//   const [isRedirecting, setIsRedirecting] = useState(false);

//   useEffect(() => {
//     if (error) {
//       setLoginError(
//         error.message || "Failed to process login. Please try again."
//       );
//       console.error("Auth0 error:", error);
//       return;
//     }

//     if (!isLoading) {
//       if (user) {
//         setIsRedirecting(true);
//         router.push("/dashboard");
//       } else {
//         setIsRedirecting(true);
//         router.push("/api/auth/login");
//       }
//     }
//   }, [isLoading, user, error, router]);

//   if (isLoading || isRedirecting) {
//     return (
//       <div
//         className="flex items-center justify-center h-screen"
//         role="status"
//         aria-label="Loading"
//       >
//         <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
//         <span className="sr-only">Loading...</span>
//       </div>
//     );
//   }

//   if (loginError) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-red-500">{loginError}</div>
//       </div>
//     );
//   }

//   return null;
// }

import { login, logout } from "../../actions/auth";
import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";

// import Link from "next/link";
// import ProfileServer from "@/components/ui/ProfileServer";

export default async function Home() {
  const session = await getSession();
  const isAuthenticated = !!session;

  // Redirect to dashboard if user is authenticated
  if (isAuthenticated) {
    redirect("/dashboard");
  }
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {!isAuthenticated && (
            <form action={login}>
              <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all">
                Login
              </button>
            </form>
          )}

          {/* <Link
            href="/admin"
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium shadow-md hover:bg-gray-300 transition-all"
          >
            Admin Page dnckjsd🛡️
          </Link>
          <Link
            href="/logged-in"
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium shadow-md hover:bg-gray-300 transition-all"
          >
            Logged In Page 🔐
          </Link>
          <Link
            href="/api/public"
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium shadow-md hover:bg-gray-300 transition-all"
          >
            Public API 🌍
          </Link>
          <Link
            href="/api/protected"
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium shadow-md hover:bg-gray-300 transition-all"
          >
            Protected Admin API 🔒
          </Link> */}
        </div>

        {/* Profile Section */}
        <div className="border-t border-gray-300 pt-6 text-center">
          {isAuthenticated ? (
            <>
              {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Welcome back, {session?.user?.name || "User"}! 🎉
              </h2> */}
              {/* <ProfileServer /> */}
            </>
          ) : (
            <h2 className="text-xl font-semibold text-gray-800">
              Please log in to see your profile details.
            </h2>
          )}
        </div>
      </div>
    </section>
  );
}
