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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { data: sessionData } = useSession();

  return (
    <ResizablePanelGroup
      autoSaveId="ledgerly-side-bar"
      direction="horizontal"
      className="h-full w-full"
    >
      <ResizablePanel defaultSize={15} maxSize={15} minSize={5}>
        <div className="space-a flex h-full w-full flex-col  justify-between  p-6">
          {/* <div className="flex flex-col items-center justify-items-start gap-4"> */}
          <SideNav />
          <div className="flex flex-col gap-2">
            <ThemeToggle />
            {sessionData?.user ? (
              <UserNav user={sessionData.user} />
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
        <div className="flex h-full w-full items-center justify-center  p-6">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default DashboardLayout;
