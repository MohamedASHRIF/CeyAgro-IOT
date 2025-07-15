import Link from "next/link";
import { ShieldAlert } from "lucide-react";

const warningMessages = [
  "Oops! Looks like you took a wrong turn into Admin Land. No tourists allowed! 😆",
  "Access Denied! Did you really think you could sneak in? Nice try. 😏",
  "This page is for VIPs only. Your name isn’t on the list… yet. 🤷‍♂️",
  "Error 403: You shall not pass! (Gandalf’s orders) 🧙‍♂️",
  "This is a restricted area. Are you the chosen one? Nope, not today. ❌",
  "🚨 Security Alert: We caught you trying to access forbidden territory! Back to safety.",
  "Oops! No backstage passes available. Try bribing the admin with coffee. ☕",
  "This page is like a secret club. And you… well, you’re not on the guest list. 🎫",
  "Permission denied. But hey, at least you tried. 😂",
  "Access restricted. Did you bring cookies? No? Then no entry! 🍪",
];

// Pick a random funny message
const randomMessage =
  warningMessages[Math.floor(Math.random() * warningMessages.length)];

export default function UnauthorizedPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl px-10 py-12 max-w-md w-full text-center space-y-6">
        {/* Warning Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>

        {/* Title & Random Message */}
        <h1 className="text-3xl font-extrabold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 text-lg">{randomMessage}</p>

        {/* Redirect Button */}
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}
