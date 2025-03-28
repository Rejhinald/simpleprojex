"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useNavigation } from "@/app/contexts/navigation-context";

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startNavigation, endNavigation } = useNavigation();
  const prevPathRef = useRef(pathname);
  const prevSearchParamsRef = useRef(searchParams);

  useEffect(() => {
    // Only trigger navigation if the path or search params actually changed
    const currentPath = pathname;
    const currentSearchParams = searchParams?.toString() || "";
    const prevPath = prevPathRef.current;
    const prevSearchParams = prevSearchParamsRef.current?.toString() || "";
    
    if (currentPath !== prevPath || currentSearchParams !== prevSearchParams) {
      // Path or search params changed - trigger navigation
      startNavigation();
      
      const timeout = setTimeout(() => {
        endNavigation();
      }, 1000); // 1 second navigation simulation
      
      // Update refs
      prevPathRef.current = currentPath;
      prevSearchParamsRef.current = searchParams;
      
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [pathname, searchParams, startNavigation, endNavigation]);

  return null;
}