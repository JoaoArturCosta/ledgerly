"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import SideNav from "@/components/SideNav";
import ThemeToggle from "@/components/ThemeToggle";
import { useSession, signIn } from "next-auth/react";
import { UserNav } from "@/components/UserNav";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "./DatePicker";
import ViewSelector from "./ViewSelector";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  viewsList: { value: string; label: string }[];
}

const Layout = ({ children, title, viewsList = [] }: LayoutProps) => {
  const { data: sessionData } = useSession();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false as const);

  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <ResizablePanelGroup
        autoSaveId="ledgerly-side-bar"
        direction="horizontal"
        className="h-full w-full"
      >
        <ResizablePanel
          className="bg-zinc-50 dark:bg-slate-900 "
          defaultSize={15}
          maxSize={20}
          minSize={15}
          collapsible
          collapsedSize={5}
          onCollapse={() => setIsCollapsed(true)}
          onResize={(size) => {
            setIsCollapsed(size < 15);
          }}
        >
          <div
            className={cn(
              `space-a flex h-full w-full flex-col  justify-between  p-6`,
              isCollapsed && "px-2 duration-500 ",
            )}
          >
            <SideNav isCollapsed={isCollapsed} />
            <div className="flex flex-col items-center gap-8">
              <ThemeToggle isCollapsed={isCollapsed} />
              {sessionData?.user ? (
                <UserNav isCollapsed={isCollapsed} user={sessionData.user} />
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    void signIn();
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={85}>
          <div className="relative h-full w-full p-10">
            <div className="flex  items-end justify-between pb-6">
              <h2 className="text-3xl font-bold">{title}</h2>
              <DatePicker />
            </div>
            {!!viewsList.length && <ViewSelector viewsList={viewsList} />}
            <div className="h-full max-h-[80vh] w-full overflow-y-auto">
              {children}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
};

export default Layout;
