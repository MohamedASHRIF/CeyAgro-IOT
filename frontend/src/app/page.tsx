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

// import { login, logout } from "../../actions/auth";
// import { getSession } from "@auth0/nextjs-auth0";
// import Link from "next/link";
// // import ProfileServer from "";

// export default async function Home() {
//   const session = await getSession();
//   const isAuthenticated = !!session;

//   return (
//     <section className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
//         {/* Navigation Buttons */}
//         <div className="flex flex-wrap gap-4 justify-center mb-8">
//           {!isAuthenticated ? (
//             <form action={login}>
//               <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all">
//                 Login
//               </button>
//             </form>
//           ) : (
//             <form action={logout}>
//               <button className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium shadow-md hover:bg-red-700 transition-all">
//                 Logout
//               </button>
//             </form>
//           )}
//         </div>

//         {/* Profile Section */}
//         <div className="border-t border-gray-300 pt-6 text-center">
//           {isAuthenticated ? (
//             <>
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                 Welcome back, {session?.user?.name || "User"}! 🎉
//               </h2>
//               {/* <ProfileServer /> */}
//             </>
//           ) : (
//             <h2 className="text-xl font-semibold text-gray-800">
//               Please log in to see your profile details.
//             </h2>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

//------------------------------
// import { login, logout } from "../../actions/auth";
// import { getSession } from "@auth0/nextjs-auth0";
// // import Link from "next/link";

// export default async function Home() {
//   const session = await getSession();
//   const isAuthenticated = !!session;

//   return (
//     <section className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
//         {/* Navigation Buttons */}
//         <div className="flex flex-wrap gap-4 justify-center mb-8">
//           {!isAuthenticated ? (
//             <form action={login}>
//               <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all">
//                 Login
//               </button>
//             </form>
//           ) : (
//             <form action={logout}>
//               <button className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium shadow-md hover:bg-red-700 transition-all">
//                 Logout
//               </button>
//             </form>
//           )}
//         </div>

//         {/* Profile Section */}
//         <div className="border-t border-gray-300 pt-6 text-center">
//           {isAuthenticated ? (
//             <>
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                 Welcome back, {session?.user?.name || "User"}! 🎉
//               </h2>
//               {/* <ProfileServer /> */}
//             </>
//           ) : (
//             <h2 className="text-xl font-semibold text-gray-800">
//               Please log in to see your profile details.
//             </h2>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

"use server";

import { login } from "../../actions/auth";
import { getSession } from "@auth0/nextjs-auth0";
import ThreeJsBackground from "./ThreeJsBackground"; // Import client component

export default async function Home() {
  const session = await getSession();
  const isAuthenticated = !!session;
  const userName = session?.user?.name ?? "User"; // Safely handle null with fallback

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 relative">
      {/* Client-side Three.js background */}
      <ThreeJsBackground />

      <div className="bg-white rounded-2xl shadow-xl p-10 sm:p-16 max-w-3xl w-full text-center transform transition-all hover:shadow-2xl relative z-10">
        {/* Company Logo */}
        <img
          src="/image.png"
          alt="Company Logo"
          className="mx-auto mb-8 h-20 sm:h-24 object-contain"
        />

        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
          {isAuthenticated ? `Welcome Back!` : `Welcome to Your Dashboard`}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          {isAuthenticated
            ? `You're signed in as ${userName}. Ready to explore your dashboard?`
            : `Sign in to access your personalized dashboard and manage your profile with ease.`}
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {!isAuthenticated ? (
            <form action={login}>
              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-4 bg-teal-500 text-white rounded-lg font-semibold text-xl shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:-translate-y-1"
              >
                Sign In
              </button>
            </form>
          ) : (
            <a
              href="/dashboard"
              className="w-full sm:w-auto px-10 py-4 bg-blue-500 text-white rounded-lg font-semibold text-xl shadow-md hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-1"
            >
              Go to Dashboard
            </a>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-base text-gray-500">
          {isAuthenticated
            ? `Manage your account and settings in the dashboard.`
            : `New here? Sign in to get started!`}
        </div>
      </div>
    </section>
  );
}
