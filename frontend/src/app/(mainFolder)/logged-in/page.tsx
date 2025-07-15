import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import Link from "next/link";

const welcomeMessages = [
  "Welcome to your dashboard! No capes required. 🦸‍♂️",
  "You made it! Now, what’s the plan, boss? 🤔",
  "You're in! Don't break anything... or do. 😏",
  "Welcome back! Time to pretend you’re working. 👀",
  "Authorized personnel only. You barely made the cut. 😆",
  "Finally! Someone with taste and class has arrived. 🎩",
  "Welcome back! Your kingdom awaits, Your Majesty. 👑",
  "You again? Alright, make yourself comfortable. 🛋️",
  "Dashboard unlocked! Achievement: Existing. 🏆",
  "Back so soon? Couldn’t stay away, huh? 😏",
];

// Pick a random message
const randomMessage =
  welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

export default async function LoggedIn() {
  const session = await getSession();

  if (!session) {
    redirect("/unauthorized");
  }

  const user = session?.user;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg px-10 py-12 max-w-md w-full text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Welcome backgfbg,
          <span className="text-indigo-600 block mt-1">
            {user?.name || "Mysterious Traveler"} 👋
          </span>
        </h1>
        <p className="text-gray-600 my-4">{randomMessage}</p>
        {/* Redirect Button */}
        <Link
          href="/"
          className="inline-block bg-gradient-to-r mt-2 from-blue-500 to-blue-600 text-white px-8 py-3 rounded-md font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}
