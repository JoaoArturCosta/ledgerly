"use client";

import { Button } from "@/components/ui/button";
import { type ClientSafeProvider, signIn } from "next-auth/react";
import { DynamicFaIcon } from "./DynamicFaIcon";
import { AUTH_PROVIDER_ICONS } from "./constants/icons";

interface AuthButtonProps {
  provider: ClientSafeProvider;
}

export default function AuthButton({ provider }: AuthButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full p-4"
      onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
    >
      <span className="flex items-center gap-2 text-nowrap p-4">
        <DynamicFaIcon name={AUTH_PROVIDER_ICONS[provider.name]!.faIconName} />
        {provider.name}
      </span>
    </Button>
  );
}
