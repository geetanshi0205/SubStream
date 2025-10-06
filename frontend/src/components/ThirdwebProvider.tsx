"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/lib/thirdweb";

export function CustomThirdwebProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider client={client}>
      {children}
    </ThirdwebProvider>
  );
}