"use client";

import { useState, useEffect, memo, ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  FileSignature,
  Check,
  Loader2,
  FileText,
  AlertTriangle,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { proposalApi, Proposal } from "../../api/apiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Form schema definition
const formSchema = z.object({
  client_name: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  client_initials: z.string().min(1, { message: "Client initials required." }).max(5),
  contractor_name: z.string().min(2, { message: "Contractor name must be at least 2 characters." }),
  contractor_initials: z.string().min(1, { message: "Contractor initials required." }).max(5),
  terms_and_conditions: z.string().min(10, { message: "Terms & conditions must be at least 10 characters." }),
});


interface GenerateContractDialogProps {
  proposal: Proposal;
  onContractGenerated: () => void;
  children?: ReactNode;
  className?: string;
}

function GenerateContractDialogComponent({
  proposal,
  onContractGenerated,
  children,
  className = "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
}: GenerateContractDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [error, setError] = useState<string | null>(null);
  const [showContractExistsWarning, setShowContractExistsWarning] = useState(false);
  const [contractExists, setContractExists] = useState(false);
  
  // Current date/time and user login
  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
    
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: "",
      client_initials: "",
      contractor_name: `${userLogin} Construction`,
      contractor_initials: userLogin.substring(0, 2).toUpperCase(),
      terms_and_conditions: 
`1. All work to be completed within 45 days of start date.
2. Payment schedule: 30% deposit, 40% at framing completion, 30% upon final inspection.
3. Warranty: 1 year on labor, manufacturer warranties on materials.
4. Change orders must be approved in writing before work begins.
5. Contractor not responsible for unknown conditions discovered during project.`,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        client_name: "",
        client_initials: "",
        contractor_name: `${userLogin} Construction`,
        contractor_initials: userLogin.substring(0, 2).toUpperCase(),
        terms_and_conditions: 
`1. All work to be completed within 45 days of start date.
2. Payment schedule: 30% deposit, 40% at framing completion, 30% upon final inspection.
3. Warranty: 1 year on labor, manufacturer warranties on materials.
4. Change orders must be approved in writing before work begins.
5. Contractor not responsible for unknown conditions discovered during project.`,
      });
      setActiveTab("details");
      setProgressValue(0);
      setError(null);
      setContractExists(false);
      setShowContractExistsWarning(false);
    }
  }, [isOpen, form, userLogin]);

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleCreateContract = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    setProgressValue(20);
    setError(null);
    
    try {
      setProgressValue(40);
      
      // 1. Check if a contract already exists by attempting to create one
      try {
        await proposalApi.generateContract(proposal.id, {
          client_name: values.client_name,
          client_initials: values.client_initials,
          contractor_name: values.contractor_name,
          contractor_initials: values.contractor_initials,
          terms_and_conditions: values.terms_and_conditions,
        });
        
        // If we get here, the contract was created successfully
        setProgressValue(100);
        toast.success("Contract generated successfully");
        onContractGenerated();
        
        setTimeout(() => {
          setIsOpen(false);
        }, 500);
      } catch (error) {
        // If there's a 400 error about contract already existing
        if (error instanceof Error && error.message.includes("400")) {
          setContractExists(true);
          setShowContractExistsWarning(true);
          setProgressValue(0);
        } else {
          // For other errors, just show the error message
          throw error;
        }
      }
    } catch (error) {
      console.error("Contract generation error:", error);
      setProgressValue(0);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to generate contract. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const previewContent = () => {
    const values = form.getValues();
    return (
      <div className="border rounded-md p-4 text-sm space-y-6">
        <div className="text-center border-b pb-4">
          <h3 className="font-bold text-lg">SERVICE CONTRACT</h3>
          <p>Based on Proposal: {proposal.name}</p>
          <p>Created: {currentDate}</p>
          {contractExists && <p className="text-amber-600 font-medium mt-1">Revision</p>}
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">CLIENT INFORMATION</h4>
          <p><span className="font-medium">Name:</span> {values.client_name || "[Not specified]"}</p>
          <p><span className="font-medium">Initials:</span> {values.client_initials || "[Not specified]"}</p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">CONTRACTOR INFORMATION</h4>
          <p><span className="font-medium">Name:</span> {values.contractor_name || "[Not specified]"}</p>
          <p><span className="font-medium">Initials:</span> {values.contractor_initials || "[Not specified]"}</p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">TERMS & CONDITIONS</h4>
          <div className="whitespace-pre-line bg-muted/30 p-3 rounded text-xs">
            {values.terms_and_conditions || "[Not specified]"}
          </div>
        </div>
        
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-semibold">SIGNATURES</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-b pb-2">
              <p>Client Signature</p>
              <p className="text-xs text-muted-foreground">To be signed digitally</p>
            </div>
            <div className="border-b pb-2">
              <p>Contractor Signature</p>
              <p className="text-xs text-muted-foreground">To be signed digitally</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to handle button click
  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  // This function will handle the user's decision to proceed with creating a new contract
  // despite one already existing. This is a workaround since we can't modify the backend.
  const handleReplaceExistingContract = async () => {
    // 1. Close the warning dialog
    setShowContractExistsWarning(false);
    
    // 2. Show an informational message
    setError(null);
    
    // 3. Show a success message with instructions
    toast.info(
      "Please save a copy of the previous contract if needed, then create a new contract revision using the same form."
    );
    
    // 4. Set a flag to indicate that we're creating a revision
    setContractExists(true);
    
    // Add "REVISION" to the contract name or some other indicator
    form.setValue("terms_and_conditions", 
      `REVISION - ${new Date().toLocaleString('en-US')}\n\n${form.getValues().terms_and_conditions}`
    );
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className={className}
        onClick={handleOpenDialog}
      >
        {children || (
          <>
            <FileSignature className="h-4 w-4" />
            Generate Contract
          </>
        )}
      </Button>
      
      {/* Contract already exists warning dialog */}
      <AlertDialog open={showContractExistsWarning} onOpenChange={setShowContractExistsWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-amber-500" />
              <AlertDialogTitle>Contract Already Exists</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              A contract has already been generated for this proposal. Creating a new contract 
              will serve as a revision to the previous contract. Previous contracts will remain 
              in the system but may be superseded by this new version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceExistingContract}>
              Continue with Revision
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[700px] p-0">
          <div className="w-full">
            {isGenerating && (
              <div className="absolute inset-x-0 top-0 z-10">
                <Progress value={progressValue} className="h-1 rounded-none" />
              </div>
            )}
            
            <DialogHeader className="p-6 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <DialogTitle className="text-xl">
                  {contractExists ? "Generate Contract Revision" : "Generate Contract"}
                </DialogTitle>
              </div>
              <DialogDescription>
                Create a contract based on proposal: <span className="font-medium">{proposal.name}</span>
                {contractExists && (
                  <span className="text-amber-600 block mt-1">
                    This will create a revised version of the existing contract.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="px-6 pt-2">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 mt-2">
                <TabsList className="grid grid-cols-2 mb-2">
                  <TabsTrigger value="details">Contract Details</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </div>

              <div className="max-h-[60vh] overflow-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateContract)} className="space-y-6">
                    <TabsContent value="details" className="p-6 mt-0">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6">
                            <h3 className="font-medium">Client Information</h3>
                            
                            <FormField
                              control={form.control}
                              name="client_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Client Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Smith" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Full name of the client
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="client_initials"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Client Initials</FormLabel>
                                  <FormControl>
                                    <Input placeholder="JS" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Used for digital signature
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="space-y-6">
                            <h3 className="font-medium">Contractor Information</h3>
                            
                            <FormField
                              control={form.control}
                              name="contractor_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contractor Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your Company Name" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Your company or business name
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="contractor_initials"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contractor Initials</FormLabel>
                                  <FormControl>
                                    <Input placeholder="AR" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Used for digital signature
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="terms_and_conditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Terms & Conditions</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter terms and conditions..." 
                                  className="min-h-[200px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Legal terms governing the agreement
                                {contractExists && (
                                  <span className="text-amber-600 block mt-1">
                                    Update terms to reflect any changes in this revision.
                                  </span>
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="p-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-medium">
                          {contractExists ? "Contract Revision Preview" : "Contract Preview"}
                        </h3>
                        {previewContent()}
                        <p className="text-xs text-muted-foreground">
                          Note: This is a preview only. The final contract may appear differently.
                        </p>
                      </div>
                    </TabsContent>
                  </form>
                </Form>
              </div>

              <DialogFooter className="p-6 bg-muted/30 flex flex-row justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                
                <div className="flex gap-2">
                  {activeTab === "details" ? (
                    <Button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                    >
                      Preview Contract
                    </Button>
                  ) : (
                    <Button
                      onClick={form.handleSubmit(handleCreateContract)}
                      disabled={isGenerating}
                      className={`${contractExists 
                        ? "bg-amber-600 hover:bg-amber-700" 
                        : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {contractExists ? "Generate Revision" : "Generate Contract"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const GenerateContractDialog = memo(GenerateContractDialogComponent);