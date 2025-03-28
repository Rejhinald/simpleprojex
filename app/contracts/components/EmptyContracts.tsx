"use client";

import { motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyContracts() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 space-y-4 w-full"
    >
      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-medium">No contracts found</h3>
      <p className="text-muted-foreground">
        To create a contract, go to a proposal detail page and use the Generate Contract form.
      </p>
      <Link href="/proposals">
        <Button 
          className="mt-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          View Proposals
        </Button>
      </Link>
    </motion.div>
  );
}