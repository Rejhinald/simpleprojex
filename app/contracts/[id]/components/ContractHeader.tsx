"use client";

import { motion } from "framer-motion";
import { 
  RefreshCw, 
  Printer, 
  ArrowLeft, 
  Pen, 
  PenBox, 
  Trash2,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Contract, Proposal } from "../../../api/apiService";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContractHeaderProps {
  contract: Contract;
  proposal: Proposal | null;
  onSign: (type: 'client' | 'contractor') => void;
  onDelete: () => void;
  onPrint: () => void;
  onRefresh: () => Promise<void>;
}

export function ContractHeader({ 
  contract, 
  proposal,
  onSign,
  onDelete,
  onPrint,
  onRefresh
}: ContractHeaderProps) {
  const copyClientLink = () => {
    const clientUrl = `${window.location.origin}/contracts/${contract.id}/client`;
    navigator.clipboard.writeText(clientUrl);
    toast.success("Client signing link copied to clipboard");
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 print:hidden">
      <div className="flex items-center gap-2">
        <Link href="/contracts">
          <Button variant="outline" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        
        <div>
          <div className="flex items-center gap-2">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              Contract #{contract.id}
            </motion.h1>
            
            {contract.version > 1 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                Revision {contract.version}
              </Badge>
            )}
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
            className="text-muted-foreground mt-1"
          >
            {proposal?.name || `Proposal #${contract.proposal_id}`}
          </motion.p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh contract</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyClientLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy client link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={onPrint}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        
        {!contract.client_signed_at && (
          <Button 
            variant="outline"
            className="flex-1 sm:flex-none text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            onClick={() => onSign('client')}
          >
            <Pen className="mr-2 h-4 w-4" />
            Client Sign
          </Button>
        )}
        
        {!contract.contractor_signed_at && (
          <Button 
            variant="outline"
            className="flex-1 sm:flex-none text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            onClick={() => onSign('contractor')}
          >
            <PenBox className="mr-2 h-4 w-4" />
            Contractor Sign
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open menu</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-red-600 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Contract
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}