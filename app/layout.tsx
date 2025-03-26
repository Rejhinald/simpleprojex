"use client";

import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarNav } from "@/components/sidebar-nav";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarContextProvider, useSidebarContext } from "@/app/contexts/sidebar-context";
import { motion } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: ReactNode;
}

function MainContent({ children }: { children: ReactNode }) {
  const { isExpanded } = useSidebarContext();

  return (
    <motion.main
      className="flex-1 p-8 relative z-30 w-full"
      initial={false}
      animate={{
        marginLeft: isExpanded ? "240px" : "64px"
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.main>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SidebarContextProvider>
            <div className="flex min-h-screen relative">
              <div className="fixed left-0 top-0 h-full z-40">
                <SidebarProvider defaultOpen={false}>
                  <SidebarNav />
                </SidebarProvider>
              </div>
              <MainContent>
                {children}
              </MainContent>
            </div>
          </SidebarContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}