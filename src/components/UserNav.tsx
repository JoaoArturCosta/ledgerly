"use client";

import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, CreditCard, Crown, Settings } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api } from "@/trpc/react";

type Props = {
  isCollapsed?: boolean;
  user: Pick<User, "name" | "image" | "email">;
};

export function UserNav({ isCollapsed, user }: Props) {
  const { data: subscription } =
    api.subscription.getCurrentSubscription.useQuery();
  const createPortalSession = api.subscription.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    },
  });

  const handleManageBilling = () => {
    createPortalSession.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={cn(
            `grid grid-cols-9 items-center gap-0`,
            isCollapsed && "grid-cols-2",
          )}
        >
          <UserAvatar
            user={{ name: user.name ?? null, image: user.image ?? null }}
            className="col-span-2 h-8 w-8 cursor-pointer"
          />
          {!isCollapsed && (
            <div className="col-span-7 flex flex-col items-start justify-items-center">
              <p className="text-xs font-medium">{user.name}</p>
              <p className="w-[150px] truncate text-left text-[9px] font-medium text-zinc-500">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="max-w-[200px]">
        <div className="flex items-center justify-start gap-4 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[170px] truncate text-sm text-zinc-700 dark:text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Subscription Section */}
        <DropdownMenuItem asChild>
          <Link href="/pricing" className="w-full cursor-pointer">
            <Crown className="mr-2 h-4 w-4" aria-hidden="true" />
            {subscription?.plan === "free" ? "Upgrade Plan" : "View Plans"}
          </Link>
        </DropdownMenuItem>

        {subscription?.plan !== "free" && (
          <DropdownMenuItem
            onClick={handleManageBilling}
            disabled={createPortalSession.isLoading}
          >
            <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
            {createPortalSession.isLoading ? "Loading..." : "Manage Billing"}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              void signOut();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Log Out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
