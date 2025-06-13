"use client";

import { Button } from "@/components/ui/button";
import { type ClientSafeProvider, signIn } from "next-auth/react";
import { DynamicFaIcon } from "./DynamicFaIcon";
import { AUTH_PROVIDER_ICONS } from "./constants/icons";

interface AuthButtonProps {
  provider: ClientSafeProvider;
  className?: string;
}

export default function AuthButton({ provider, className }: AuthButtonProps) {
  const iconKey = provider.id.toLowerCase();
  const iconName = AUTH_PROVIDER_ICONS[iconKey]?.faIconName || null;

  return (
    <Button
      variant="outline"
      className={className ? className : "w-full p-4"}
      onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
    >
      <span className="flex items-center gap-2 text-nowrap p-4">
        <DynamicFaIcon name={iconName} />
        {provider.name}
      </span>
    </Button>
  );
}
