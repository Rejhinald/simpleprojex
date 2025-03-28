"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

type NavigationContextType = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  currentPath: string;
  currentDate: string;
  currentUser: string;
  startNavigation: () => void;
  endNavigation: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname || "");
  const [currentDate, setCurrentDate] = useState("");
  const [currentUser] = useState("Admin");
  
  // Update the path without causing re-renders in children
  useEffect(() => {
    setCurrentPath(pathname || "");
  }, [pathname]);

  // Update date only when loading state changes
  useEffect(() => {
    // Set initial date
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toISOString().slice(0, 19).replace("T", " ");
      setCurrentDate(formatted);
    };
    
    updateDate();
    
    // Update date every second when loading
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      interval = setInterval(updateDate, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);
  
  // Memoize these functions to prevent unnecessary re-renders
  const startNavigation = useCallback(() => {
    setIsLoading(true);
  }, []);
  
  const endNavigation = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = {
    isLoading,
    setIsLoading,
    currentPath,
    currentDate,
    currentUser,
    startNavigation,
    endNavigation
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}