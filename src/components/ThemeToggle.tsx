"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

const ThemeToggle = ({ isCollapsed }: ThemeToggleProps) => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="h-9 w-9 rounded-md border"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />

        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Tabs defaultValue={theme} onValueChange={setTheme}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="light"
          className="flex items-center justify-center gap-2  "
        >
          <Sun className=" h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 " />
          Light
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          className="flex items-center justify-center gap-2"
        >
          <Moon className="h-4 w-4 rotate-90  transition-transform dark:rotate-0 dark:scale-100" />
          Dark
        </TabsTrigger>
        <TabsContent value="light" />
        <TabsContent value="dark" />
      </TabsList>
    </Tabs>
  );
};

export default ThemeToggle;
