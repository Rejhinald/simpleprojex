"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  contractApi, 
  proposalApi, 
  Contract, 
  Proposal, 
  ElementValue 
} from "../../../api/apiService";
import { Button } from "@/components/ui/button";
import { ContractTerms } from "../components/ContractTerms";
import { ContractCostTable } from "../components/ContractCostTable";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientSignatureDialog } from "./components/ClientSignatureDialog";
import { toast } from "sonner";
import { PenLine, FileCheck, Printer } from "lucide-react";

export default function ClientContractViewPage() {
  const params = useParams();
  const contractId = Number(params.id);
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [elementValues, setElementValues] = useState<ElementValue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!contractId) return;
    void loadContractData();
  }, [contractId]);
  
  const loadContractData = async () => {
    try {
      setLoading(true);
      const contractData = await contractApi.getById(contractId);
      setContract(contractData);
      
      if (contractData.proposal_id) {
        const proposalData = await proposalApi.getById(contractData.proposal_id);
        setProposal(proposalData);
        
        const elementValuesData = await proposalApi.getElementValues(contractData.proposal_id);
        setElementValues(elementValuesData);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignClick = () => {
    setSignatureDialogOpen(true);
  };
  
  const handleSignatureSuccess = async () => {
    setSignatureDialogOpen(false);
    await loadContractData();
    toast.success("Contract signed successfully");
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-4"></div>
          <div className="h-4 w-32 bg-blue-200 mb-2"></div>
          <div className="h-4 w-24 bg-blue-200"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Contract</h2>
          <p className="text-gray-700 mb-4">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-amber-50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-semibold text-amber-600 mb-2">Contract Not Found</h2>
          <p className="text-gray-700 mb-4">The requested contract could not be found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-6 max-w-4xl"
    >
      <div className="flex flex-col items-center mb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight"
        >
          Contract Review & Signature
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-muted-foreground mt-1"
        >
          {proposal?.name || 'Project Contract'} - For {contract.client_name}
        </motion.p>
      </div>
      
      {contract.client_signed_at ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-center text-green-700">
          <FileCheck className="h-5 w-5 mr-2" />
          <p>
            This contract has been signed on {new Date(contract.client_signed_at).toLocaleString()}
          </p>
        </div>
      ) : null}
      
      <div className="bg-white p-6 rounded-lg shadow-md print:shadow-none">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase">CONSTRUCTION CONTRACT</h2>
          <p className="text-lg">{proposal?.name || 'Contract'}</p>
          {contract.version > 1 && (
            <p className="text-sm text-amber-600 mt-1">Revision {contract.version}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-lg border-b pb-1 mb-2">Client Information</h3>
            <p><strong>Name:</strong> {contract.client_name}</p>
            {contract.client_signed_at && (
              <p>
                <strong>Signed:</strong> {new Date(contract.client_signed_at).toLocaleString()}
                <span className="ml-2">({contract.client_initials})</span>
              </p>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-lg border-b pb-1 mb-2">Contractor Information</h3>
            <p><strong>Name:</strong> {contract.contractor_name}</p>
            {contract.contractor_signed_at && (
              <p>
                <strong>Signed:</strong> {new Date(contract.contractor_signed_at).toLocaleString()}
                <span className="ml-2">({contract.contractor_initials})</span>
              </p>
            )}
          </div>
        </div>
        
        {elementValues.length > 0 && (
          <div className="mb-8">
            <ContractCostTable elementValues={elementValues} />
          </div>
        )}
        
        <div className="mb-8">
          <ContractTerms termsAndConditions={contract.terms_and_conditions} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="border-t pt-4">
            <p className="mb-1 font-medium">Client Signature:</p>
            <div className="h-16 border-b border-dashed flex items-end justify-center relative">
              {contract.client_signed_at ? (
                <div className="absolute inset-0 flex items-end justify-center">
                  {contract.client_signature ? (
                    <img 
                      src={contract.client_signature}
                      alt="Client signature" 
                      className="max-h-[60px] max-w-[80%] object-contain mb-1"
                    />
                  ) : (
                    <p className="italic font-medium text-xl mb-1">{contract.client_initials}</p>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center print:hidden">
                  <p className="text-muted-foreground text-center text-sm italic">
                    Add your signature below to complete this contract
                  </p>
                </div>
              )}
            </div>
            <p className="mt-1">
              Date: {contract.client_signed_at ? 
                new Date(contract.client_signed_at).toLocaleDateString() : 
                '________________'}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <p className="mb-1 font-medium">Contractor Signature:</p>
            <div className="h-16 border-b border-dashed flex items-end justify-center relative">
              {contract.contractor_signed_at ? (
                <div className="absolute inset-0 flex items-end justify-center">
                  {contract.contractor_signature ? (
                    <img 
                      src={contract.contractor_signature} 
                      alt="Contractor signature" 
                      className="max-h-[60px] max-w-[80%] object-contain mb-1"
                    />
                  ) : (
                    <p className="italic font-medium text-xl mb-1">{contract.contractor_initials}</p>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center print:hidden">
                  <p className="text-muted-foreground text-center text-sm italic">
                    Awaiting contractor signature
                  </p>
                </div>
              )}
            </div>
            <p className="mt-1">
              Date: {contract.contractor_signed_at ? 
                new Date(contract.contractor_signed_at).toLocaleDateString() : 
                '________________'}
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center text-gray-500 text-sm print:mt-16">
          <p>Contract generated on {new Date(contract.created_at).toLocaleString()}</p>
          <p>Contract ID: {contract.id}</p>
        </div>
      </div>
      
      {!contract.client_signed_at && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 print:hidden">
          <h3 className="text-lg font-bold mb-4 text-blue-800">Contract Acceptance</h3>
          
          <div className="flex items-start space-x-3 mb-4">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                setTermsAccepted(checked === true);
              }}
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I, {contract.client_name}, have read and agree to the terms and conditions of this contract.
              I understand that by signing this document, I am entering into a legally binding agreement.
            </label>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <Button 
              variant="outline"
              onClick={() => window.print()}
              className="min-w-[120px]"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            
            <Button 
              onClick={handleSignClick}
              disabled={!termsAccepted}
              className="bg-green-600 hover:bg-green-700 min-w-[180px]"
            >
              <PenLine className="mr-2 h-4 w-4" />
              Sign Contract
            </Button>
          </div>
          
          {!termsAccepted && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please accept the terms and conditions to sign this contract.
            </p>
          )}
        </div>
      )}
      
      <ClientSignatureDialog
        isOpen={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onSuccess={handleSignatureSuccess}
        contractId={contractId}
        clientName={contract.client_name}
        clientInitials={contract.client_initials}
      />
    </motion.div>
  );
}