import { isUserAdmin } from "@/actions/isUserAdmin";
import { NextResponse } from "next/server";

export async function GET() {
    const isAdmin = await isUserAdmin();

    if (!isAdmin) {
        const funnyMessages = [
            "Nice try, but you're not on the VIP list! 🚷",
            "Oops! This door is locked for non-admins. 🔒",
            "You need admin powers to pass... or a magic spell! 🧙‍♂️",
            "Access denied! Maybe try again in your next life? 🔁",
            "You're about to be reported for trespassing! 🚨",
        ];

        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

        return NextResponse.json({ error: randomMessage }, { status: 401 });
    }

    return NextResponse.json({
        message: "Welcome, Admin! You've unlocked the restricted zone 🚀",
    });
}