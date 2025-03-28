"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface PageLoaderProps {
  /**
   * Title displayed below the spinner
   */
  title?: string;
  
  /**
   * Description displayed below the title
   */
  message?: string;
  
  /**
   * Whether to show the current date/time
   */
  showDate?: boolean;
  
  /**
   * Whether to show the current user
   */
  showUser?: boolean;
  
  /**
   * Whether this is a fullscreen overlay (fixed position)
   * or an in-flow element (within page flow)
   */
  fullscreen?: boolean;
  
  /**
   * Height for in-flow loaders (ignored if fullscreen=true)
   */
  height?: string;
  
  /**
   * Custom classname to apply to the container
   */
  className?: string;
  
  /**
   * Whether to show a backdrop blur effect (only for fullscreen)
   */
  blur?: boolean;
  
  /**
   * Whether to show the spinner
   */
  showSpinner?: boolean;
}

export function PageLoader({
  title = "Loading...",
  message = "Please wait while we fetch the data",
  showDate = false,
  showUser = false,
  fullscreen = false,
  height = "h-[70vh]",
  className = "",
  blur = true,
  showSpinner = true
}: PageLoaderProps) {
  // Only calculate date if needed (performance optimization)
  const currentDate = showDate ? new Date().toISOString().slice(0, 19).replace("T", " ") : "";
  const currentUser = "Admin";
  
  // Container styles
  const containerStyle = fullscreen
    ? `fixed inset-0 ${blur ? 'backdrop-blur-sm' : ''} bg-background/70 z-50 flex items-center justify-center ${className}`
    : `flex items-center justify-center ${height} ${className}`;

  return (
    <motion.div
      className={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} // Faster transition
    >
      <div className={`flex flex-col items-center ${fullscreen ? 'bg-card p-8 rounded-lg border shadow-lg' : ''}`}>
        {showSpinner && (
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        )}
        {title && <h3 className="text-lg font-medium">{title}</h3>}
        {message && <p className="text-muted-foreground mt-1">{message}</p>}
        
        {(showDate || showUser) && (
          <div className="mt-4 text-xs text-muted-foreground">
            {showDate && (
              <p>Current Date and Time: {currentDate}</p>
            )}
            {showUser && (
              <p>Current User: {currentUser}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}