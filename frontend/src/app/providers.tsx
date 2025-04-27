"use client";

import { UserProvider } from "@auth0/nextjs-auth0/client";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import React from "react";
>>>>>>> Stashed changes
=======
import React from "react";
>>>>>>> Stashed changes
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
