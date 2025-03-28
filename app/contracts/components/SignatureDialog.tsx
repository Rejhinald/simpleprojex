import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenBox, Upload, Check } from "lucide-react";
import { useContractContext } from "../contexts/ContractContext";
import { Contract } from "../../api/apiService";

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  contractId: number | undefined;
  signatureType: 'client' | 'contractor' | undefined;
}

export function SignatureDialog({
  isOpen,
  onClose,
  onSuccess,
  contractId,
  signatureType
}: SignatureDialogProps) {
  const { contracts, signContract, uploadSignature } = useContractContext();
  const [selectedTab, setSelectedTab] = useState<string>("initials");
  const [initials, setInitials] = useState<string>("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Find the contract details to pre-populate fields
  const contract: Contract | undefined = contracts.find(c => c.id === contractId);
  
  // Reset form when dialog opens or contract changes
  useEffect(() => {
    if (isOpen && contract && signatureType) {
      setInitials(signatureType === 'client' ? contract.client_initials : contract.contractor_initials);
      setSignatureFile(null);
    }
  }, [isOpen, contract, signatureType]);
  
  const handleSubmit = async () => {
    if (!contractId || !signatureType) return;
    
    setIsSubmitting(true);
    try {
      let success = false;
      
      if (selectedTab === "upload" && signatureFile) {
        // Use the file upload endpoint instead
        success = await uploadSignature(contractId, signatureType, initials, signatureFile);
      } else {
        // Use the regular signing endpoint for initials-only
        success = await signContract(contractId, signatureType, initials, null);
      }
      
      if (success) {
        await onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignatureFile(e.target.files[0]);
    }
  };
  
  const clearFile = () => {
    setSignatureFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Show a different title based on the type of signature
  const dialogTitle = signatureType === 'client' 
    ? "Client Signature" 
    : "Contractor Signature";
  
  // Show description based on type
  const dialogDescription = signatureType === 'client'
    ? `Sign on behalf of client: ${contract?.client_name || 'Client'}`
    : `Sign as contractor: ${contract?.contractor_name || 'Contractor'}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenBox className="h-5 w-5 text-green-600" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="initials" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="initials">Sign with Initials</TabsTrigger>
            <TabsTrigger value="upload">Upload Signature</TabsTrigger>
          </TabsList>
          
          <TabsContent value="initials" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initials">Enter Initials</Label>
              <Input
                id="initials"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                placeholder="e.g., JS"
                maxLength={5}
                className="text-center text-lg font-bold"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signature">Upload Signature Image</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <input
                  id="signature"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                
                {signatureFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <img 
                        src={URL.createObjectURL(signatureFile)} 
                        alt="Signature preview" 
                        className="max-h-[100px] max-w-full object-contain"
                      />
                    </div>
                    <p className="text-sm">{signatureFile.name}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button"
                      onClick={clearFile}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (max 2MB)</p>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Upload an image of your signature to be used on this contract.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || (selectedTab === "initials" && !initials) || (selectedTab === "upload" && !signatureFile)}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              "Signing..."
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Sign Contract
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}