"use client";

import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarNav } from "@/components/sidebar-nav";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarContextProvider, useSidebarContext } from "@/app/contexts/sidebar-context";
import { motion } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: ReactNode;
}

// This adds a fixed CSS style to fix the background width
const FixedStyles = () => {
  useEffect(() => {
    // This injects a style tag to ensure the sidebar container is always at least 64px wide
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      [data-slot="sidebar-container"] {
        min-width: 64px !important;
      }
      
      [data-slot="sidebar-inner"] {
        min-width: 64px !important;
      }
      
      /* Prevent content from being clipped */
      .sidebar-container {
        min-width: 64px !important;
      }
    `;
    document.head.appendChild(styleTag);
    
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);
  
  return null;
};

function MainContent({ children }: { children: ReactNode }) {
  const { isExpanded } = useSidebarContext();

  return (
    <motion.main
      className="flex-1 p-12 relative z-10 w-full"
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
            {/* This component injects CSS to fix the width issue */}
            <FixedStyles />
            <div className="flex min-h-screen relative">
              <div className="fixed left-0 top-0 h-full z-30 bg-background dark:bg-background shadow-lg">
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