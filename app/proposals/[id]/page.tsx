"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  proposalApi, 
  templateApi,
  categoryApi,
  Proposal, 
  VariableValue, 
  ElementValue, 
  Template,
  Category
} from "../../api/apiService";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PieChart, Layers, ListChecks } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNavigation } from "@/app/contexts/navigation-context";

// Import the components
import { ProposalHeader } from "../components/ProposalHeader";
import { ProposalVariables } from "../components/ProposalVariables";
import { ProposalElements } from "../components/ProposalElements";
import { ProposalCategories } from "../components/ProposalCategories";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = Number(params.id);
  const { startNavigation, endNavigation } = useNavigation();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [variableValues, setVariableValues] = useState<VariableValue[]>([]);
  const [elementValues, setElementValues] = useState<ElementValue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  
  // Calculate totals
  const totalMaterial = elementValues.reduce((sum, element) => 
    sum + parseFloat(element.calculated_material_cost), 0);
  const totalLabor = elementValues.reduce((sum, element) => 
    sum + parseFloat(element.calculated_labor_cost), 0);
  const totalBeforeMarkup = totalMaterial + totalLabor;
  const totalAfterMarkup = elementValues.reduce((sum, element) => 
    sum + (element.total_with_markup ?? 0), 0);
  
  // Signal page load on component mount
  useEffect(() => {
    if (initialLoad) {
      // Trigger loading indicator manually for direct navigation
      window.dispatchEvent(new CustomEvent('route-changed', { 
        detail: { 
          path: window.location.pathname,
          proposalName: 'Proposal'
        }
      }));
      setInitialLoad(false);
    }
  }, [initialLoad]);
  
  // Memoize loadProposalData to avoid recreation on every render
  const loadProposalData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      startNavigation(); // Start global navigation loading state
      
      // Run these requests in parallel for better performance
      const [proposalData, variableValuesData, elementValuesData, categoriesData] = await Promise.all([
        proposalApi.getById(proposalId),
        proposalApi.getVariableValues(proposalId),
        proposalApi.getElementValues(proposalId),
        categoryApi.getFromProposal(proposalId) // Get categories directly from the API
      ]);
      
      setProposal(proposalData);
      setVariableValues(variableValuesData);
      setElementValues(elementValuesData);
      setCategories(categoriesData);
      
      // Update loader with the actual proposal name once we have it
      if (proposalData && proposalData.name) {
        window.dispatchEvent(new CustomEvent('route-changed', { 
          detail: { 
            path: window.location.pathname,
            proposalName: proposalData.name
          }
        }));
      }
      
      // Load template if available
      if (proposalData.template_id) {
        try {
          const templateData = await templateApi.getById(proposalData.template_id);
          setTemplate(templateData);
        } catch (err) {
          console.error("Failed to load template details:", err);
        }
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      endNavigation(); // End global navigation loading state
    }
  }, [proposalId, startNavigation, endNavigation]);
  
  // Auto-sync with template when component mounts
  const syncWithTemplate = useCallback(async (isSilent: boolean = false): Promise<void> => {
    if (!proposal?.template_id) return; // Only sync if proposal has a template
    
    try {
      if (!isSilent) {
        setSyncing(true);
      }
      
      const result = await proposalApi.syncWithTemplate(proposalId);
      
      // If this is not a silent sync, show a success message with details
      if (!isSilent) {
        if (result.added_variables.length > 0 || result.updated_variables.length > 0 || result.added_elements.length > 0) {
          let message = "Proposal synced with the latest template changes.";
          
          if (result.added_variables.length > 0) {
            message += ` Added ${result.added_variables.length} new variables.`;
          }
          
          if (result.updated_variables.length > 0) {
            message += ` Updated ${result.updated_variables.length} variables.`;
          }
          
          if (result.added_elements.length > 0) {
            message += ` Added ${result.added_elements.length} new elements.`;
          }
          
          toast.success(message);
        } else {
          toast.info("Your proposal is already up to date with the template.");
        }
      } else if (result.added_variables.length > 0 || result.updated_variables.length > 0 || result.added_elements.length > 0) {
        // Show a less intrusive message for automatic sync
        toast.info("Proposal automatically synced with template changes.");
      }
      
      // Reload the proposal data to show the new items
      await loadProposalData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      
      if (!isSilent) {
        toast.error(`Failed to sync with template: ${errorMessage}`);
      } else {
        // Log errors for silent syncs but don't show intrusive errors
        console.error("Auto-sync failed:", errorMessage);
      }
    } finally {
      if (!isSilent) {
        setSyncing(false);
      }
    }
  }, [proposal?.template_id, proposalId, loadProposalData]);
  
  // Load data on component mount
  useEffect(() => {
    if (!proposalId) return;
    
    // Load data after a short delay to allow navigation events to be properly set up
    const timer = setTimeout(() => {
      loadProposalData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [proposalId, loadProposalData]);
  
  // Sync with template when proposal is loaded and has a template ID
  useEffect(() => {
    if (proposal?.template_id) {
      syncWithTemplate(true); // Silent sync on initial load
    }
  }, [proposal?.template_id, syncWithTemplate]);
  
  // During initial loading, return nothing to allow global loader to be visible
  if (loading && !proposal) {
    return null;
  }
  
  // Only show error if loading has occurred
  if (error) {
    return (
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Alert variant="destructive" className="border-red-300">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button onClick={() => loadProposalData()} variant="outline" className="mr-2">
                Retry
              </Button>
              <Button onClick={() => router.push("/proposals")}>
                Back to Proposals
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }
  
  // Only show "Not Found" if we've tried loading and the proposal wasn't found
  if (!loading && !proposal) {
    return (
      <motion.div 
        className="text-center py-12"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium">Proposal Not Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto mt-1 mb-4">
          The requested proposal could not be found or may have been deleted.
        </p>
        <Button onClick={() => router.push("/proposals")}>
          Back to Proposals
        </Button>
      </motion.div>
    );
  }
  
  // If we get here, we have a proposal to display
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="space-y-6"
        key="proposal-content"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={staggerContainer}
      >
        {/* Header with proposal information */}
        <motion.div variants={slideUp}>
          <ProposalHeader
            proposal={proposal!}
            isLoading={loading}
            isSyncing={syncing}
            onSync={() => syncWithTemplate(false)}
            onRefresh={loadProposalData}
            templateName={template?.name}
            totalMaterial={totalMaterial}
            totalLabor={totalLabor}
            totalBeforeMarkup={totalBeforeMarkup}
            totalAfterMarkup={totalAfterMarkup}
          />
        </motion.div>
        
        {/* Tab navigation with fixed tab size like the reference code */}
        <motion.div variants={slideUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="variables" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <span>Variables</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Categories</span>
              </TabsTrigger>
              <TabsTrigger value="elements" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Elements</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Main content sections side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Variables overview */}
                <motion.div variants={slideUp} transition={{ delay: 0.1 }}>
                  <ProposalVariables
                    proposalId={proposalId}
                    variables={variableValues}
                    onRefresh={loadProposalData}
                  />
                </motion.div>
                
                {/* Categories overview */}
                <motion.div variants={slideUp} transition={{ delay: 0.2 }}>
                  <ProposalCategories 
                    categories={categories}
                    proposalId={proposalId}
                    onRefresh={loadProposalData}
                  />
                </motion.div>
              </div>
              
              {/* Elements section */}
              <motion.div variants={slideUp} transition={{ delay: 0.3 }}>
                <ProposalElements 
                  elementValues={elementValues} 
                  proposalId={proposalId}
                  onRefresh={loadProposalData}
                />
              </motion.div>
              
              {/* Financial summary moved to the bottom of overview */}
              <motion.div variants={slideUp} transition={{ delay: 0.4 }}>
                <Card className="shadow-sm">
                  <CardHeader className="py-4 px-6">
                    <CardTitle className="text-base font-medium">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <motion.div 
                      className="space-y-6"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05
                          }
                        }
                      }}
                    >
                      <motion.div variants={slideUp} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Material Cost</span>
                          <span className="text-sm font-medium">${totalMaterial.toFixed(2)}</span>
                        </div>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <Progress value={(totalMaterial / totalBeforeMarkup) * 100} className="h-2 bg-muted" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.div variants={slideUp} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Labor Cost</span>
                          <span className="text-sm font-medium">${totalLabor.toFixed(2)}</span>
                        </div>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                        >
                          <Progress value={(totalLabor / totalBeforeMarkup) * 100} className="h-2 bg-muted" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.div variants={slideUp}>
                        <Separator />
                      </motion.div>
                      
                      <motion.div variants={slideUp} className="flex justify-between py-2">
                        <span className="font-medium">Subtotal</span>
                        <span>${totalBeforeMarkup.toFixed(2)}</span>
                      </motion.div>
                      
                      <motion.div variants={slideUp} className="flex justify-between py-2">
                        <span className="font-medium">Markup Amount</span>
                        <span>${(totalAfterMarkup - totalBeforeMarkup).toFixed(2)}</span>
                      </motion.div>
                      
                      <motion.div variants={slideUp}>
                        <Separator />
                      </motion.div>
                      
                      <motion.div 
                        variants={slideUp} 
                        className="flex justify-between py-2 text-lg font-semibold"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <span>Total (with markup)</span>
                        <span className="text-green-600 dark:text-green-500">${totalAfterMarkup.toFixed(2)}</span>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            {/* Variables tab */}
            <TabsContent value="variables">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProposalVariables
                  proposalId={proposalId}
                  variables={variableValues}
                  onRefresh={loadProposalData}
                />
              </motion.div>
            </TabsContent>
            
            {/* Categories tab - new tab added */}
            <TabsContent value="categories">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProposalCategories
                  categories={categories}
                  proposalId={proposalId}
                  onRefresh={loadProposalData}
                />
              </motion.div>
            </TabsContent>
            
            {/* Elements tab */}
            <TabsContent value="elements" className="space-y-6">
              {/* Elements section */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProposalElements 
                  elementValues={elementValues} 
                  proposalId={proposalId}
                  onRefresh={loadProposalData}
                />
              </motion.div>
              
              {/* Financial summary */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="shadow-sm">
                  <CardHeader className="py-4 px-6">
                    <CardTitle className="text-base font-medium">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <motion.div 
                      className="space-y-6"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05,
                            delayChildren: 0.1
                          }
                        }
                      }}
                    >
                      <motion.div variants={slideUp} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Material Cost</span>
                          <span className="text-sm font-medium">${totalMaterial.toFixed(2)}</span>
                        </div>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <Progress value={(totalMaterial / totalBeforeMarkup) * 100} className="h-2 bg-muted" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.div variants={slideUp} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Labor Cost</span>
                          <span className="text-sm font-medium">${totalLabor.toFixed(2)}</span>
                        </div>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                        >
                          <Progress value={(totalLabor / totalBeforeMarkup) * 100} className="h-2 bg-muted" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.div variants={slideUp}>
                        <Separator />
                      </motion.div>
                      
                      <motion.div variants={slideUp} className="flex justify-between py-2">
                        <span className="font-medium">Subtotal</span>
                        <span>${totalBeforeMarkup.toFixed(2)}</span>
                      </motion.div>
                      
                      <motion.div variants={slideUp} className="flex justify-between py-2">
                        <span className="font-medium">Markup Amount</span>
                        <span>${(totalAfterMarkup - totalBeforeMarkup).toFixed(2)}</span>
                      </motion.div>
                      
                      <motion.div variants={slideUp}>
                        <Separator />
                      </motion.div>
                      
                      <motion.div 
                        variants={slideUp} 
                        className="flex justify-between py-2 text-lg font-semibold"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <span>Total (with markup)</span>
                        <span className="text-green-600 dark:text-green-500">${totalAfterMarkup.toFixed(2)}</span>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}