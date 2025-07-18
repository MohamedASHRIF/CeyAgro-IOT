import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch("http://localhost:3001/dashboard/stats"); // NestJS backend
        if (!response.ok) {
            throw new Error("Failed to fetch data from backend");
        }

        const data = await response.json();
        return NextResponse.json(data); // Return data properly
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}
