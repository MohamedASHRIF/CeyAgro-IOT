"use server";

import { redirect } from "next/navigation";
import { getSession } from "@auth0/nextjs-auth0";

export async function login() {
    redirect("/api/auth/login?returnTo=/chat");
}

export async function logout() {
    redirect("/api/auth/logout");
}

// Get the current user's ID from Auth0 session
export async function getUserId(): Promise<string> {
    const session = await getSession();
    if (!session?.user) {
        throw new Error("User not authenticated");
    }
    return session.user.sub;
}