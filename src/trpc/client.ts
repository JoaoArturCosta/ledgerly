"use client";

import type { AppRouter } from "@/server/api/root";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { transformer } from "@/trpc/shared";

export const api = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});
