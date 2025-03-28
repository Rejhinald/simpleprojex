"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { templateApi, proposalApi, contractApi } from "@/app/api/apiService";

export function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState("Loading...");
  const [progress, setProgress] = useState(0);
  const lastPathRef = useRef(pathname);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Define handler functions outside useEffect so they can be reused
  const handleRouteChangeStart = useCallback((url: string) => {
    // Reset and show loader
    setProgress(0);
    setIsLoading(true);

    // Set initial generic title based on path
    let genericTitle = "Loading...";
    
    if (url.includes('/templates')) {
      genericTitle = "Loading template...";
    } else if (url.includes('/proposals')) {
      genericTitle = "Loading proposal...";
    } else if (url.includes('/contracts')) {
      genericTitle = "Loading contract...";
    }
    
    setLoadingTitle(genericTitle);
    
    // Check if this is a known detail page
    const templateMatch = url.match(/\/templates\/(\d+)/);
    const proposalMatch = url.match(/\/proposals\/(\d+)/);
    const contractMatch = url.match(/\/contracts\/(\d+)/);
    
    // Fetch entity title if it's a detail page
    if (templateMatch) {
      const id = parseInt(templateMatch[1]);
      templateApi.getById(id).then(template => {
        setLoadingTitle(`Loading: ${template.name}`);
      }).catch(() => {});
    } else if (proposalMatch) {
      const id = parseInt(proposalMatch[1]);
      proposalApi.getById(id).then(proposal => {
        setLoadingTitle(`Loading: ${proposal.name}`);
      }).catch(() => {});
    } else if (contractMatch) {
      const id = parseInt(contractMatch[1]);
      contractApi.getById(id).then(contract => {
        setLoadingTitle(`Loading: ${contract.client_name}`);
      }).catch(() => {});
    }
    
    // Start progress animation
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        // Progress gets slower as it approaches 90%
        const increment = Math.max(0.5, (100 - prev) / 20);
        const newProgress = prev + increment;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 100);
  }, []);

  const handleRouteChangeEnd = useCallback(() => {
    // Complete progress animation and hide loader
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    // Quick jump to 100%
    setProgress(100);
    
    // Then hide after a short delay
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  // Handle navigation events and simulate progress
  useEffect(() => {
    // Manual route change detection
    if (pathname !== lastPathRef.current) {
      handleRouteChangeStart(pathname || "");
      lastPathRef.current = pathname;
      
      // Simulate route change completion after reasonable time
      const timer = setTimeout(() => {
        handleRouteChangeEnd();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      };
    }
  }, [pathname, handleRouteChangeStart, handleRouteChangeEnd]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

  // Custom event listener for explicit route changes
  useEffect(() => {
    const handleCustomRouteChange = (event: CustomEvent) => {
      const detail = event.detail;
      if (!detail || !detail.path) return;
      
      // Handle both template and proposal paths
      if (detail.path.includes('/templates/') || detail.path.includes('/proposals/') || detail.path.includes('/contracts/')) {
        handleRouteChangeStart(detail.path);
        
        // Use the entity name if available
        if (detail.templateName) {
          setLoadingTitle(`Loading: ${detail.templateName}`);
        } else if (detail.proposalName) {
          setLoadingTitle(`Loading: ${detail.proposalName}`);
        } else if (detail.contractName) {
          setLoadingTitle(`Loading: ${detail.contractName}`);
        }
        
        // Hide after a delay
        setTimeout(() => {
          handleRouteChangeEnd();
        }, 800);
      }
    };
  
    window.addEventListener('route-changed', handleCustomRouteChange as EventListener);
    
    return () => {
      window.removeEventListener('route-changed', handleCustomRouteChange as EventListener);
    };
  }, [handleRouteChangeStart, handleRouteChangeEnd]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Blurred backdrop with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-md" />
          
          {/* Content container */}
          <motion.div 
            className="relative z-10 flex flex-col items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {/* Simple elegant spinner */}
            <div className="mb-8 relative">
              <div className="w-16 h-16 relative">
                {/* Main circular track */}
                <div className="absolute inset-0 rounded-full border-2 border-gray-700 opacity-30"></div>
                
                {/* Spinning gradient arc */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-transparent"
                  style={{
                    borderTopColor: "#60a5fa",
                    borderRightColor: "#818cf8",
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 1.2
                  }}
                ></motion.div>
              </div>
            </div>
            
            {/* Loading title */}
            <h2 className="text-white text-xl font-light tracking-wide mb-6">
              {loadingTitle}
            </h2>
            
            {/* Progress bar */}
            <div className="w-60 sm:w-80 h-[2px] bg-gray-700/50 overflow-hidden rounded-full">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            
            {/* Progress percentage */}
            <p className="text-gray-400 text-xs mt-2 font-light">
              {Math.round(progress)}%
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}