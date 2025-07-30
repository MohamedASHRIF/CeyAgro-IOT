// import { handleAuth } from "@auth0/nextjs-auth0";
// import { NextRequest } from "next/server";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ auth0: string }> }
// ) {
//   const auth0 = await (await params).auth0; // Await the dynamic param
//   const handler = handleAuth();
//   return handler(request, { params: { auth0 } });
// }

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ auth0: string }> }
// ) {
//   const auth0 = await (await params).auth0; // Await the dynamic param
//   const handler = handleAuth();
//   return handler(request, { params: { auth0 } });
// }

import { handleAuth } from "@auth0/nextjs-auth0";

export const GET = handleAuth();
