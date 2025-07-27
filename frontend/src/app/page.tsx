// "use server";

// import { login } from "../../actions/auth";
// import { getSession } from "@auth0/nextjs-auth0";
// import ThreeJsBackground from "./ThreeJsBackground"; // Import client component

// export default async function Home() {
//   const session = await getSession();
//   const isAuthenticated = !!session;
//   const userName = session?.user?.name ?? "User"; // Safely handle null with fallback

//   return (
//     <section className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 relative">
//       {/* Client-side Three.js background */}
//       <ThreeJsBackground />

//       <div className="bg-white rounded-2xl shadow-xl p-10 sm:p-16 max-w-3xl w-full text-center transform transition-all hover:shadow-2xl relative z-10">
//         {/* Company Logo */}
//         <img
//           src="/image.png"
//           alt="Company Logo"
//           className="mx-auto mb-8 h-20 sm:h-24 object-contain"
//         />

//         {/* Header */}
//         <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
//           {isAuthenticated ? `Welcome Back!` : `Welcome to Your Dashboard`}
//         </h1>
//         <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
//           {isAuthenticated
//             ? `You're signed in as ${userName}. Ready to explore your dashboard?`
//             : `Sign in to access your personalized dashboard and manage your profile with ease.`}
//         </p>

//         {/* Navigation Buttons */}
//         <div className="flex flex-col sm:flex-row gap-6 justify-center">
//           {!isAuthenticated ? (
//             <form action={login}>
//               <button
//                 type="submit"
//                 className="w-full sm:w-auto px-10 py-4 bg-teal-500 text-white rounded-lg font-semibold text-xl shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:-translate-y-1"
//               >
//                 Sign In
//               </button>
//             </form>
//           ) : (
//             <a
//               href="/dashboard"
//               className="w-full sm:w-auto px-10 py-4 bg-blue-500 text-white rounded-lg font-semibold text-xl shadow-md hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-1"
//             >
//               Go to Dashboard
//             </a>
//           )}
//         </div>

//         {/* Footer Note */}
//         <div className="mt-10 text-base text-gray-500">
//           {isAuthenticated
//             ? `Manage your account and settings in the dashboard.`
//             : `New here? Sign in to get started!`}
//         </div>
//       </div>
//     </section>
//   );
// }

"use server";

import { login } from "../../actions/auth";
import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { isUserAdmin } from "../../actions/isUserAdmin"; // Import isUserAdmin
import ThreeJsBackground from "./ThreeJsBackground"; // Import client component

export default async function Home() {
  const session = await getSession();
  const isAuthenticated = !!session;

  // If authenticated, check admin status and redirect accordingly
  if (isAuthenticated) {
    const isAdmin = await isUserAdmin();
    const redirectPath = isAdmin ? "/admin" : "/dashboard";
    redirect(redirectPath);
  }

  // If not authenticated, render the welcome page
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 relative">
      {/* Client-side Three.js background */}
      <ThreeJsBackground />

      <div className="bg-white rounded-2xl shadow-xl p-10 sm:p-10 max-w-2xl w-full text-center transform transition-all hover:shadow-2xl relative z-10">
        {/* Company Logo */}
        <img
          src="/image.png"
          alt="Company Logo"
          className="mx-auto mb-8 h-20 sm:h-24 object-contain"
        />

        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
          Welcome to Your Dashboard
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Sign in to access your personalized dashboard and manage your profile
          with ease.
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <form action={login}>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-teal-500 text-white rounded-lg font-semibold text-2xl shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:-translate-y-1"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-base text-gray-500">
          New here? Sign in to get started!
        </div>
      </div>
    </section>
  );
}
