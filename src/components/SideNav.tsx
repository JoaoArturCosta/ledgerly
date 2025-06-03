"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

import { NavItems } from "@/components/constants/side-nav";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";

interface SideNavProps {
  isCollapsed?: boolean;
  setOpen?: (open: boolean) => void;
  className?: string;
}

const SideNav = ({ isCollapsed, setOpen, className }: SideNavProps) => {
  const path = usePathname();
  return (
    <nav className={cn(`space-y-2`, isCollapsed && "duration-500", className)}>
      <Link
        href="/"
        className={cn(
          `flex items-center justify-items-start pb-6`,
          isCollapsed && "justify-center gap-0",
        )}
      >
        <Logo
          variant="sidebar"
          isCollapsed={isCollapsed}
          className={cn("gap-2", isCollapsed && "justify-center gap-0")}
        />
      </Link>
      {NavItems.map((item) => (
        <HoverCard key={item.title}>
          <HoverCardTrigger>
            <Link
              href={item.href}
              onClick={() => {
                if (setOpen) setOpen(false);
              }}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "group relative flex h-12 justify-start gap-2 px-2",
                path === item.href && "bg-muted  hover:bg-muted",
                isCollapsed && "items-center justify-center",
              )}
            >
              <item.icon className={cn("h-6 w-6", item.color)} />
              {!isCollapsed && (
                <div
                  className={cn(
                    " left-12 text-sm duration-200",
                    isCollapsed && "hidden",
                  )}
                >
                  {item.title}
                </div>
              )}
            </Link>
          </HoverCardTrigger>
          <HoverCardContent side="right">
            <div className="flex flex-col gap-2">
              <span className="font-bold">{item.title}</span>
              {item.children && <Separator />}
              {item.children?.map((child) => (
                <Link
                  key={child.title}
                  href={child.href}
                  onClick={() => {
                    if (setOpen) setOpen(false);
                  }}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "group relative flex h-12 justify-start gap-2 px-2",
                    path === child.href && "bg-muted  hover:bg-muted",
                    // isCollapsed && "items-center justify-center",
                  )}
                >
                  <child.icon className={cn("h-6 w-6", child.color)} />

                  <div className={cn(" left-12 text-sm duration-200")}>
                    {child.title}
                  </div>
                </Link>
              ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </nav>
  );
};

export default SideNav;
