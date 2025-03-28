"use client";

import { motion } from "framer-motion";
import { FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export function ContractHeader() {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  
  // Update current date and time
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    setCurrentDateTime(`${formattedDate} ${hours}:${minutes}:${seconds}`);
    
    // Update every minute
    const timer = setInterval(() => {
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      setCurrentDateTime(`${formattedDate} ${hours}:${minutes}:${seconds}`);
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-4 gap-4">
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight"
        >
          Contracts
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-muted-foreground mt-1 flex items-center"
        >
          View and manage client contracts
          <span className="text-xs ml-2 flex items-center text-muted-foreground/70">
            <Calendar className="h-3 w-3 mr-1" />
            {currentDateTime}
          </span>
        </motion.p>
      </div>

      <div>
        <Link href="/proposals">
          <Button className="bg-green-600 hover:bg-green-700">
            <FileText className="mr-2 h-4 w-4" />
            Create Contract
          </Button>
        </Link>
      </div>
    </div>
  );
}