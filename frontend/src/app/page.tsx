"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Page() {
  const {
    user,
    isLoading,
    error,
  }: { user?: any; isLoading: boolean; error?: Error | null | undefined } =
    useUser();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (error) {
      setLoginError(
        error.message || "Failed to process login. Please try again."
      );
      console.error("Auth0 error:", error);
      return;
    }

    if (!isLoading) {
      if (user) {
        setIsRedirecting(true);
        router.push("/dashboard");
      } else {
        setIsRedirecting(true);
        router.push("/api/auth/login");
      }
    }
  }, [isLoading, user, error, router]);

  if (isLoading || isRedirecting) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        role="status"
        aria-label="Loading"
      >
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (loginError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{loginError}</div>
      </div>
    );
  }

  return null;
}
