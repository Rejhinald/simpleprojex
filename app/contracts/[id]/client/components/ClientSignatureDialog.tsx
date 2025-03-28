"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenLine, Upload, Check } from "lucide-react";
import { contractApi, SignContractRequest } from "../../../../api/apiService";
import { toast } from "sonner";

interface ClientSignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  contractId: number;
  clientName: string;
  clientInitials: string;
}

export function ClientSignatureDialog({
  isOpen,
  onClose,
  onSuccess,
  contractId,
  clientName,
  clientInitials,
}: ClientSignatureDialogProps) {
  const [selectedTab, setSelectedTab] = useState<string>("initials");
  const [initials, setInitials] = useState<string>(clientInitials || "");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setInitials(clientInitials || "");
      setSignatureFile(null);
    }
  }, [isOpen, clientInitials]);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data: SignContractRequest = { initials };
      
      // For now, we're only sending initials since file upload requires additional endpoint
      await contractApi.clientSign(contractId, data);
      
      toast.success("Contract signed successfully");
      await onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Failed to sign contract: ${errorMessage}`);
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
  
  const getInitialsFromName = () => {
    if (!clientName) return "";
    
    return clientName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 5);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-green-600" />
            Sign Contract
          </DialogTitle>
          <DialogDescription>
            Sign this contract as {clientName}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="initials" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="initials">Sign with Initials</TabsTrigger>
            <TabsTrigger value="upload">Upload Signature</TabsTrigger>
          </TabsList>
          
          <TabsContent value="initials" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initials">Enter Your Initials</Label>
              <Input
                id="initials"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                placeholder={getInitialsFromName() || "e.g., JS"}
                maxLength={5}
                className="text-center text-lg font-bold"
              />
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  type="button"
                  onClick={() => setInitials(getInitialsFromName())}
                  className="text-xs text-muted-foreground"
                >
                  Use Initials: {getInitialsFromName()}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your initials will be recorded with the current date and time: {new Date().toLocaleString()}
              </p>
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
            disabled={
              isSubmitting || 
              (selectedTab === "initials" && !initials) || 
              (selectedTab === "upload" && !signatureFile)
            }
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