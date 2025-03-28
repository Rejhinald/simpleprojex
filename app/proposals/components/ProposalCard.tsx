"use client";

import { memo, useMemo, useCallback, useEffect, useState } from "react";
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
import { 
  ProposalWithDetails, 
  formatDate,
  formatCurrency,
  calculateTotalProposalCost
} from "../utils/proposal-utils";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Component,
  Percent,
  DollarSign,
  FileText,
  Variable,
  Grid3X3,
  Tag,
  RefreshCw,
} from "lucide-react";
import { useProposalContext } from '../contexts/ProposalContext';
import { proposalApi, templateApi, Template, VariableValue, ElementValue } from "../../api/apiService";
import { toast } from "sonner";
import { GenerateContractDialog } from "./GenerateContractDialog";

interface ProposalCardProps {
  proposal: ProposalWithDetails;
  isLoading: boolean;
  onDelete: (id: number) => void;
  onGenerateContract?: (id: number) => void;
}

function ProposalCardComponent({ 
  proposal, 
  isLoading,
  onDelete,
  onGenerateContract
}: ProposalCardProps) {
  const { expandedId, setExpandedId } = useProposalContext();
  const isExpanded = expandedId === proposal.id;
  
  // State for storing the data
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [templateData, setTemplateData] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<VariableValue[]>([]);
  const [elementValues, setElementValues] = useState<ElementValue[]>([]);
  const [hasSynced, setHasSynced] = useState(false);
  
  // Function to sync proposal with template
const syncWithTemplate = useCallback(async (isSilent: boolean = true) => {
    if (!proposal.template_id) return;
    
    try {
      console.log("ProposalCard: Syncing proposal", proposal.id, "with template...");
      
      const result = await proposalApi.syncWithTemplate(proposal.id);
      
      console.log("ProposalCard: Sync result:", result);
      
      if (result.added_variables.length > 0 || result.added_elements.length > 0) {
        // Only show a toast if changes were made and we're not in silent mode
        if (!isSilent) {
          let message = "Proposal synced with the latest template changes.";
          
          if (result.added_variables.length > 0) {
            message += ` Added ${result.added_variables.length} new variables.`;
          }
          
          if (result.added_elements.length > 0) {
            message += ` Added ${result.added_elements.length} new elements.`;
          }
          
          toast.success(message);
        }
        
        // Reload the data since we've made changes
        setDetailsLoading(true);
      } else if (!isSilent) {
        toast.info("Your proposal is already up to date with the template.");
      }
    } catch (err) {
      console.error("ProposalCard: Sync error:", err);
      if (!isSilent) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast.error(`Failed to sync with template: ${errorMessage}`);
      }
    } finally {
      setHasSynced(true);
    }
  }, [proposal.id, proposal.template_id]);
  
  // Sync with template once when component mounts
  useEffect(() => {
    if (proposal.template_id && !hasSynced) {
      syncWithTemplate(true);
    }
  }, [proposal.template_id, hasSynced, syncWithTemplate]);
  
  // Load all details immediately on mount - no conditional loading
  useEffect(() => {
    const loadAllDetails = async () => {
      // Skip if we already have data loaded
      if (!detailsLoading && (templateData || variableValues.length > 0 || elementValues.length > 0)) {
        return;
      }
      
      try {
        // Load template data if proposal has a template_id
        if (proposal.template_id) {
          try {
            const template = await templateApi.getById(proposal.template_id);
            setTemplateData(template);
          } catch (err) {
            console.warn(`Failed to load template for proposal ${proposal.id}:`, err);
          }
        }
        
        // Load variable values and element values in parallel
        const [variables, elements] = await Promise.all([
          proposalApi.getVariableValues(proposal.id).catch(() => []),
          proposalApi.getElementValues(proposal.id).catch(() => [])
        ]);
        
        setVariableValues(variables);
        setElementValues(elements);
      } catch (err) {
        console.error(`Failed to load details for proposal ${proposal.id}:`, err);
      } finally {
        setDetailsLoading(false);
      }
    };
    
    loadAllDetails();
  }, [proposal.id, proposal.template_id, detailsLoading, templateData, variableValues.length, elementValues.length]);
  
  // Memoize expensive calculations
  const totalCost = useMemo(() => 
    elementValues.length > 0 ? calculateTotalProposalCost(elementValues) : 0,
    [elementValues]
  );

  // Memoize event handlers
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedId(isExpanded ? null : proposal.id);
  }, [isExpanded, proposal.id, setExpandedId]);

  const handleContractGenerated = useCallback(() => {
    // Call the onGenerateContract callback if provided, for any additional actions needed
    if (onGenerateContract) {
      onGenerateContract(proposal.id);
    }
    
    // Also refresh proposal data
    setDetailsLoading(true);
    toast.success("Contract generated successfully");
  }, [onGenerateContract, proposal.id]);

  const handleDelete = useCallback(() => {
    onDelete(proposal.id);
  }, [onDelete, proposal.id]);

  // Memoize the created date display
  const createdDateDisplay = useMemo(() => 
    formatDate(proposal.created_at),
    [proposal.created_at]
  );

  // Memoize template information
  const templateInfo = useMemo(() => (
    templateData ? (
      <span className="flex items-center">
        <Component className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        {`Using template: ${templateData.name}`}
      </span>
    ) : proposal.template ? (
      <span className="flex items-center">
        <Component className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        {`Using template: ${proposal.template.name}`}
      </span>
    ) : (
      <span className="flex items-center">
        <Tag className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        Created from scratch
      </span>
    )
  ), [proposal.template, templateData]);

  // Group elements by category
  const elementsByCategory = useMemo(() => {
    return elementValues.reduce((acc, element) => {
      const categoryName = element.category_name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(element);
      return acc;
    }, {} as Record<string, ElementValue[]>);
  }, [elementValues]);

  // Get stats
  const stats = useMemo(() => {
    return {
      variableCount: variableValues.length,
      categoryCount: Object.keys(elementsByCategory).length,
      elementCount: elementValues.length
    };
  }, [variableValues.length, elementsByCategory, elementValues.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="overflow-hidden transition-all hover:shadow-md border border-gray-200/80 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-1">{proposal.name}</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 shrink-0">
              Proposal
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {templateInfo}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Clock className="mr-1 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">Created {createdDateDisplay}</span>
          </div>
          
          {/* Template sync note */}
          {proposal.template_id && (
            <div className="mt-1 mb-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Template changes automatically synced
              </span>
            </div>
          )}
          
          {/* Proposal Stats */}
          <div className="mt-auto">
            <motion.div
              initial={false}
              animate={{ 
                height: isExpanded ? 'auto' : '80px',
              }}
              className="border-t mt-2 pt-2 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 text-sm text-center">
                <div className="flex flex-col items-center border p-2 rounded-md">
                  <span className="font-medium flex items-center text-xs">
                    <Percent className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    Markup
                  </span>
                  <span className="text-lg">{proposal.global_markup_percentage}%</span>
                </div>
                <div className="flex flex-col items-center border p-2 rounded-md">
                  <span className="font-medium flex items-center text-xs">
                    <Variable className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    Variables
                  </span>
                  <span className="text-lg">{isLoading || detailsLoading ? "..." : stats.variableCount}</span>
                </div>
                <div className="flex flex-col items-center border p-2 rounded-md">
                  <span className="font-medium flex items-center text-xs">
                    <DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    Total
                  </span>
                  <span className="text-lg text-green-600">{isLoading || detailsLoading ? "..." : formatCurrency(totalCost)}</span>
                </div>
              </div>
              
              {/* Expanded content - always rendered but only visible when expanded */}
              <div 
                className={`mt-4 space-y-3 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
              >
                {isLoading || detailsLoading ? (
                  <div className="flex justify-center py-4">
                    <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <>
                    {/* Template Details */}
                    {(templateData || proposal.template) && (
                      <div className="transition-all duration-300 transform translate-y-0">
                        <h4 className="font-medium text-sm mb-1 flex items-center">
                          <Component className="h-3.5 w-3.5 mr-1 text-green-500" />
                          Template Details
                        </h4>
                        <div className="pl-5 text-sm text-muted-foreground">
                          <p>{(templateData || proposal.template)?.description || "No description provided"}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Variable Values */}
                    {variableValues.length > 0 && (
                      <div className="transition-all duration-300 transform translate-y-0">
                        <h4 className="font-medium text-sm mb-1 flex items-center">
                          <Variable className="h-3.5 w-3.5 mr-1 text-green-500" />
                          Variable Values
                        </h4>
                        <div className="pl-5 space-y-1">
                          {variableValues.map((variable) => (
                            <div key={variable.variable_id} className="text-sm flex justify-between">
                              <span className="text-muted-foreground">{variable.variable_name || `Variable #${variable.variable_id}`}:</span>
                              <span className="font-medium">{variable.value} {variable.variable_type?.replace('_', ' ').toLowerCase()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Elements by Category */}
                    {Object.keys(elementsByCategory).length > 0 && (
                      <div className="transition-all duration-300 transform translate-y-0">
                        <h4 className="font-medium text-sm mb-1 flex items-center">
                          <Grid3X3 className="h-3.5 w-3.5 mr-1 text-green-500" />
                          Categories & Elements
                        </h4>
                        <div className="pl-2 space-y-2">
                          {Object.entries(elementsByCategory).map(([categoryName, elements]) => (
                            <div key={categoryName} className="border-l-2 border-green-100 pl-3 py-1">
                              <h5 className="text-sm font-medium">{categoryName}</h5>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {elements.map(element => (
                                  <Badge key={element.element_id} variant="outline" className="text-xs">
                                    {element.element_name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Element Summary */}
                    {elementValues.length > 0 && (
                      <div className="transition-all duration-300 transform translate-y-0">
                        <h4 className="font-medium text-sm mb-1">Cost Summary</h4>
                        <div className="pl-5">
                          <div className="text-sm text-right">
                            <div className="flex justify-between">
                              <span>Total Materials:</span>
                              <span className="font-medium">
                                {formatCurrency(elementValues.reduce((sum, el) => sum + (parseFloat(el.calculated_material_cost) || 0), 0))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Labor:</span>
                              <span className="font-medium">
                                {formatCurrency(elementValues.reduce((sum, el) => sum + (parseFloat(el.calculated_labor_cost) || 0), 0))}
                              </span>
                            </div>
                            <div className="flex justify-between font-medium text-green-600 border-t pt-1 mt-1">
                              <span>Total Cost:</span>
                              <span>{formatCurrency(totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* No details available message */}
                    {!templateData && !proposal.template && variableValues.length === 0 && elementValues.length === 0 && (
                      <p className="text-sm text-center text-muted-foreground py-4">
                        No detailed information available
                      </p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0 pb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <a href={`/proposals/${proposal.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Proposal
            </a>
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={handleToggleExpand}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Details
                </>
              )}
            </Button>
            
            {/* Modified GenerateContractDialog to only show the icon */}
            <GenerateContractDialog
              proposal={proposal}
              onContractGenerated={handleContractGenerated}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-9 w-9 p-0 flex items-center justify-center"
            >
              <FileText className="h-4 w-4" />
            </GenerateContractDialog>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export const ProposalCard = memo(ProposalCardComponent);