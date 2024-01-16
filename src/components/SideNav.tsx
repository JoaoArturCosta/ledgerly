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
import { Boxes, ChevronDownIcon } from "lucide-react";
import { usePathname } from "next/navigation";

interface SideNavProps {
  isOpen?: boolean;
  setOpen?: (open: boolean) => void;
  className?: string;
}

const SideNav = ({ isOpen, setOpen, className }: SideNavProps) => {
  const path = usePathname();
  const [openItem, setOpenItem] = useState("");
  const [lastOpenItem, setLastOpenItem] = useState("");

  return (
    <nav className="space-y-2">
      <Link
        href="/"
        className="hidden items-center justify-items-start gap-2 px-4 pb-6 md:flex"
      >
        <Boxes className="h-6 w-6" />
        <h1 className="text-lg font-semibold">Ledgerly</h1>
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
                  "group relative flex h-12 justify-between px-4 py-2 text-base duration-200 hover:bg-muted hover:no-underline",
                )}
              >
                <div>
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
                <div
                  className={cn(
                    "absolute left-12 text-base duration-200",
                    !isOpen && className,
                  )}
                >
                  {item.title}
                </div>

                {isOpen && (
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                )}
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
                        !isOpen && className,
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
              "group relative flex h-12 justify-start",
              path === item.href && "bg-muted font-bold hover:bg-muted",
            )}
          >
            <item.icon className={cn("h-5 w-5", item.color)} />
            <span
              className={cn(
                "absolute left-12 text-base duration-200",
                !isOpen && className,
              )}
            >
              {item.title}
            </span>
          </Link>
        ),
      )}
    </nav>
  );
};

export default SideNav;