"use client";

import Link from "next/link";

import { NavItems } from "@/components/constants/side-nav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { Boxes } from "lucide-react";
import { usePathname } from "next/navigation";

interface SideNavProps {
  isCollapsed?: boolean;
  setOpen?: (open: boolean) => void;
  className?: string;
}

const SideNav = ({ isCollapsed, setOpen, className }: SideNavProps) => {
  const path = usePathname();
  const [openItem, setOpenItem] = useState("");
  return (
    <nav className={cn(`space-y-2`, isCollapsed && "duration-500")}>
      <Link
        href="/"
        className={cn(
          `flex items-center justify-items-start gap-2 pb-6`,
          isCollapsed && "justify-center gap-0",
        )}
      >
        <Boxes className="h-8 w-8" />
        {!isCollapsed && <h1 className=" text-lg font-semibold ">Ledgerly</h1>}
      </Link>
      {NavItems.map((item) =>
        item.isChidren ? (
          <Accordion
            type="single"
            collapsible
            className="space-y-2"
            key={item.title}
            value={openItem}
            onValueChange={setOpenItem}
          >
            <AccordionItem value={item.title} className="border-none">
              <AccordionTrigger
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "group relative flex h-12 justify-between gap-2 px-2 py-2 text-sm duration-200 hover:bg-muted hover:no-underline",
                  isCollapsed && "items-center justify-center gap-0",
                )}
              >
                <div>
                  <item.icon className={cn("h-7 w-7", item.color)} />
                </div>
                {!isCollapsed && (
                  <div
                    className={cn(
                      "absolute left-10 text-base duration-200",
                      isCollapsed && "hidden",
                    )}
                  >
                    {item.title}
                  </div>
                )}

                {/* {!isCollapsed && (
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                )} */}
              </AccordionTrigger>
              <AccordionContent className="ml-4 mt-2 space-y-2 pb-1">
                {item.children?.map((child) => (
                  <Link
                    key={child.title}
                    href={child.href}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "group flex h-12 justify-start gap-x-3",
                      path === child.href &&
                        "bg-muted font-bold hover:bg-muted",
                    )}
                  >
                    {/* Use child.icon aqui em vez de item.icon */}
                    <child.icon className={cn("h-5 w-5", child.color)} />
                    <div
                      className={cn(
                        "text-base duration-200",
                        !isCollapsed && className,
                      )}
                    >
                      {child.title}
                    </div>
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Link
            key={item.title}
            href={item.href}
            onClick={() => {
              if (setOpen) setOpen(false);
            }}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "group relative flex h-12 justify-start gap-2 px-2",
              path === item.href && "bg-muted  hover:bg-muted",
              // isCollapsed && "items-center justify-center",
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
        ),
      )}
    </nav>
  );
};

export default SideNav;
