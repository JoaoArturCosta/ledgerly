import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProviders } from "@/theme/Provider";
import { AuthProvider } from "./auth/Provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Ledgerly",
  description: "Your personal Financial manager",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <AuthProvider>
          <ThemeProviders>
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster />
          </ThemeProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
