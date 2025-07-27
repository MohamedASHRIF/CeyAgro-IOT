// lib/auth/auth.ts
"use server";

import { redirect } from "next/navigation";
import axios from "axios";
import { get okaSession } from "@auth0/nextjs-auth0";

interface AccessTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

// export async function login() {
//   redirect("/api/auth/login");
// }
export async function login() {
    redirect("/api/auth/login?returnTo=/dashboard");
}

export async function logout() {
    redirect("/api/auth/logout");
}

export async function createAccessToken(): Promise<string> {
    try {
        const response = await axios.post<AccessTokenResponse>(
            `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.AUTH0_CLIENT_ID!,
                client_secret: process.env.AUTH0_CLIENT_SECRET!,
                audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
            }),
            {
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        throw new Error("Failed to get Auth0 management token");
    }
}

type Role = {
    id: string;
    name: string;
    description: string;
};

export async function getUsersRoles(): Promise<Role[]> {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const token = await createAccessToken();

    const response = await fetch(
        `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user.sub}/roles`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch user roles");
    }

    const data: Role[] = await response.json();
    return data;
}

export async function is userAdmin(): Promise < boolean > {
    try {
        const roles = await getUsersRoles();

        console.log("ROLES", roles);
        return roles.some((role: { name: string; }) => role.name.toLowerCase() === "admin");
    } catch(error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}