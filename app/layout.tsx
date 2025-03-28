"use client";

import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarNav } from "@/components/sidebar-nav";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarContextProvider, useSidebarContext } from "@/app/contexts/sidebar-context";
import { NavigationProvider } from "@/app/contexts/navigation-context";
import { NavigationLoader } from "@/components/navigation-loader";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { NavigationEvents } from "@/components/navigation-events";

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

// Fallback component for Suspense
const SuspenseFallback = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="flex flex-col items-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
      <h3 className="text-lg font-medium">Loading application...</h3>
      <p className="text-muted-foreground">Please wait while we fetch your data.</p>
    </div>
  </div>
);

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
          <NavigationProvider>
            <SidebarContextProvider>
              {/* Navigation event listener */}
              <NavigationEvents />
              
              {/* Navigation loader */}
              <NavigationLoader />
              
              {/* This component injects CSS to fix the width issue */}
              <FixedStyles />
              
              <div className="flex min-h-screen relative">
                <div className="fixed left-0 top-0 h-full z-30 bg-background dark:bg-background shadow-lg">
                  <SidebarProvider defaultOpen={false}>
                    <SidebarNav />
                  </SidebarProvider>
                </div>
                
                <Suspense fallback={<SuspenseFallback />}>
                  <MainContent>
                    {children}
                  </MainContent>
                </Suspense>
              </div>
            </SidebarContextProvider>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}