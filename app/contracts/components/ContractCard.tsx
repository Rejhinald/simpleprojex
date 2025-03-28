"use client";

import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, 
  Trash2, 
  PenBox, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Pen,
  Copy,
  ChevronDown,
  ChevronUp,
  FileSignature,
  Clock,
  User,
  Briefcase
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistance } from "date-fns";
import { toast } from "sonner";
import { Contract } from "../../api/apiService";

interface ContractCardProps {
  contract: Contract;
  onDelete: (id: number) => void;
  onSign: (id: number, type: 'client' | 'contractor') => void;
}

function ContractCardComponent({ contract, onDelete, onSign }: ContractCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Date formatting helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not signed";
    
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} (${formatDistance(date, new Date(), { addSuffix: true })})`;
  };
  
  // Copy contract link to clipboard
  const copyContractLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/contracts/${contract.id}/client`;
    navigator.clipboard.writeText(link);
    toast.success("Client signing link copied to clipboard");
  };
  
  // Check if contract is signed by both parties
  const isFullySigned = contract.client_signed_at && contract.contractor_signed_at;
  
  // Handle toggle for expanded view
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);
  
  // Calculate signature stats and styling
  const signatureStatus = isFullySigned 
    ? "Fully Signed" 
    : (!contract.client_signed_at && !contract.contractor_signed_at)
      ? "Not Signed"
      : "Partially Signed";
      
  const statusColor = isFullySigned 
    ? "text-green-600"
    : (!contract.client_signed_at && !contract.contractor_signed_at)
      ? "text-orange-500"
      : "text-blue-600";
      
  const statusBg = isFullySigned 
    ? "bg-green-50"
    : (!contract.client_signed_at && !contract.contractor_signed_at)
      ? "bg-orange-50"
      : "bg-blue-50";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="overflow-hidden transition-all hover:shadow-md border border-gray-200/80 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base font-semibold line-clamp-1 flex items-center">
              <FileSignature className="h-4 w-4 text-blue-600 mr-1.5" />
              Contract #{contract.id}
              {contract.version > 1 && (
                <Badge variant="outline" className="ml-2 text-xs py-0 h-5">
                  v{contract.version}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
              {/* Action buttons moved to upper right */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyContractLink}
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Copy client signing link</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/contracts/${contract.id}`}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>View contract details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0 py-0 h-5 ml-1">
                Contract
              </Badge>
            </div>
          </div>
          <CardDescription className="line-clamp-1 text-xs mt-1">
            <span className="flex items-center">
              Based on Proposal #{contract.proposal_id}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col py-2 px-6">
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Clock className="mr-1.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="line-clamp-1">Created {formatDate(contract.created_at)}</span>
          </div>
          
          {/* Contract Status */}
          <div className="mt-auto">
            <motion.div
              initial={false}
              animate={{ 
                height: isExpanded ? 'auto' : '84px',
              }}
              className="border-t mt-2 pt-3 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-3 text-sm text-center">
                <div className={`flex flex-col items-center border p-2 rounded-md ${statusBg} border-opacity-50`}>
                  <span className="font-medium text-[0.65rem] uppercase tracking-wide mb-1 text-gray-500">
                    Status
                  </span>
                  <span className={`text-sm font-semibold ${statusColor}`}>
                    {signatureStatus}
                  </span>
                </div>
                
                {/* Client signature status with tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center border p-2 rounded-md bg-slate-50 cursor-help">
                        <span className="font-medium text-[0.65rem] uppercase tracking-wide mb-1 text-gray-500">
                          Client
                        </span>
                        <div className="flex items-center justify-center h-5">
                          {contract.client_signed_at ? (
                            <div className="bg-green-100 text-green-700 rounded-full p-0.5">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="bg-orange-100 text-orange-600 rounded-full p-0.5">
                              <XCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {contract.client_signed_at ? (
                        <p className="text-xs">
                          <span className="font-medium">Signed:</span> {formatDate(contract.client_signed_at)}
                          <br />
                          <span className="font-medium">Client:</span> {contract.client_name}
                          <br />
                          <span className="font-medium">Initials:</span> {contract.client_initials}
                        </p>
                      ) : (
                        <p className="text-xs">Client signature required</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Contractor signature status with tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center border p-2 rounded-md bg-slate-50 cursor-help">
                        <span className="font-medium text-[0.65rem] uppercase tracking-wide mb-1 text-gray-500">
                          Contractor
                        </span>
                        <div className="flex items-center justify-center h-5">
                          {contract.contractor_signed_at ? (
                            <div className="bg-green-100 text-green-700 rounded-full p-0.5">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="bg-orange-100 text-orange-600 rounded-full p-0.5">
                              <XCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {contract.contractor_signed_at ? (
                        <p className="text-xs">
                          <span className="font-medium">Signed:</span> {formatDate(contract.contractor_signed_at)}
                          <br />
                          <span className="font-medium">Contractor:</span> {contract.contractor_name}
                          <br />
                          <span className="font-medium">Initials:</span> {contract.contractor_initials}
                        </p>
                      ) : (
                        <p className="text-xs">Contractor signature required</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Expanded content - always rendered but only visible when expanded */}
              <div 
                className={`mt-4 space-y-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Info */}
                  <div className="transition-all duration-300 transform translate-y-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="bg-blue-100 rounded-full p-1">
                        <User className="h-3 w-3 text-blue-700" />
                      </div>
                      <h4 className="font-medium text-sm text-blue-700">Client</h4>
                    </div>
                    <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3">
                      <p className="font-medium text-sm">{contract.client_name}</p>
                      <div className="mt-1 pt-1 border-t border-blue-100/50">
                        <div className="flex items-center text-xs text-gray-600">
                          {contract.client_signed_at ? (
                            <div className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                              <span>Signed {formatDate(contract.client_signed_at)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <XCircle className="h-3 w-3 text-orange-500 mr-1" />
                              <span>Not signed yet</span>
                            </div>
                          )}
                        </div>
                        {contract.client_signed_at && (
                          <div className="mt-1 text-xs text-gray-600">
                            <span className="font-medium">Initials:</span> {contract.client_initials}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contractor Info */}
                  <div className="transition-all duration-300 transform translate-y-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="bg-blue-100 rounded-full p-1">
                        <Briefcase className="h-3 w-3 text-blue-700" />
                      </div>
                      <h4 className="font-medium text-sm text-blue-700">Contractor</h4>
                    </div>
                    <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3">
                      <p className="font-medium text-sm">{contract.contractor_name}</p>
                      <div className="mt-1 pt-1 border-t border-blue-100/50">
                        <div className="flex items-center text-xs text-gray-600">
                          {contract.contractor_signed_at ? (
                            <div className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                              <span>Signed {formatDate(contract.contractor_signed_at)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <XCircle className="h-3 w-3 text-orange-500 mr-1" />
                              <span>Not signed yet</span>
                            </div>
                          )}
                        </div>
                        {contract.contractor_signed_at && (
                          <div className="mt-1 text-xs text-gray-600">
                            <span className="font-medium">Initials:</span> {contract.contractor_initials}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Terms & Conditions Preview */}
                <div className="transition-all duration-300 transform translate-y-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="bg-gray-100 rounded-full p-1">
                      <FileText className="h-3 w-3 text-gray-600" />
                    </div>
                    <h4 className="font-medium text-sm text-gray-700">Terms & Conditions</h4>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed italic">
                      {contract.terms_and_conditions || "No terms specified"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-1 pb-3 px-6">
          <div className="text-xs text-muted-foreground">
            {!isFullySigned && (
              <div className="italic">
                {!contract.client_signed_at && !contract.contractor_signed_at 
                  ? "Awaiting signatures"
                  : "Awaiting final signature"}
              </div>
            )}
          </div>
          
          <div className="flex gap-1 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs h-8"
              onClick={handleToggleExpand}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  <span className="text-xs">Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  <span className="text-xs">Details</span>
                </>
              )}
            </Button>
            
            {!contract.client_signed_at && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 w-8 h-8"
                        onClick={() => onSign(contract.id, 'client')}
                      >
                        <Pen className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Sign as Client</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {!contract.contractor_signed_at && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 w-8 h-8"
                        onClick={() => onSign(contract.id, 'contractor')}
                      >
                        <PenBox className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Sign as Contractor</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="destructive" 
                      size="sm"
                      className="p-0 w-8 h-8"
                      onClick={() => onDelete(contract.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Delete Contract</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Memoize the component to avoid unnecessary re-renders
export const ContractCard = memo(ContractCardComponent);