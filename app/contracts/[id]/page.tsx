"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  contractApi, 
  proposalApi, 
  Contract, 
  Proposal, 
  ElementValue 
} from "../../api/apiService";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ContractHeader } from "./components/ContractHeader";
import { ContractSignatures } from "./components/ContractSignatures";
import { ContractTerms } from "./components/ContractTerms";
import { ContractCostTable } from "./components/ContractCostTable";
import { ContractDetailSkeleton } from "./components/ContractDetailSkeleton";
import { SignatureDialog } from "../components/SignatureDialog";
import { DeleteContractDialog } from "../components/DeleteContractDialog";
import { ContractProvider } from "../contexts/ContractContext";
import { toast } from "sonner";

export default function ContractDetailPage() {
  return (
    <ContractProvider>
      <ContractDetailContent />
    </ContractProvider>
  );
}

function ContractDetailContent() {
  const params = useParams();
  const contractId = Number(params.id);
  const router = useRouter();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [elementValues, setElementValues] = useState<ElementValue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<'client' | 'contractor'>('client');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!contractId || isNaN(contractId)) {
      setError("Invalid contract ID");
      setLoading(false);
      return;
    }
    
    loadContractData();
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
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to load contract: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignClick = (type: 'client' | 'contractor') => {
    setSignatureType(type);
    setSignatureDialogOpen(true);
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteContract = async () => {
    try {
      await contractApi.delete(contractId);
      toast.success("Contract deleted successfully");
      router.push("/contracts");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Failed to delete contract: ${errorMessage}`);
    }
  };
  
  const handleSignatureSuccess = async () => {
    setSignatureDialogOpen(false);
    await loadContractData();
    toast.success(`Contract signed successfully as ${signatureType === 'client' ? 'client' : 'contractor'}`);
  };
  
  if (loading) {
    return <ContractDetailSkeleton />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Contract</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="default" onClick={() => router.push("/contracts")}>
          Return to Contracts
        </Button>
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">Contract Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested contract could not be found.</p>
        <Button variant="default" onClick={() => router.push("/contracts")}>
          Return to Contracts
        </Button>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-6 max-w-4xl"
    >
      <ContractHeader 
        contract={contract} 
        proposal={proposal}
        onSign={handleSignClick}
        onDelete={handleDeleteClick}
        onPrint={() => window.print()}
        onRefresh={loadContractData}
      />
      
      <Separator className="my-6" />
      
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
        
        <ContractSignatures 
          contract={contract}
          onClientSign={() => handleSignClick('client')}
          onContractorSign={() => handleSignClick('contractor')}
        />
        
        <div className="mt-8 text-center text-gray-500 text-sm print:mt-16">
          <p>Contract generated on {new Date(contract.created_at).toLocaleString()}</p>
          <p>Contract ID: {contract.id} | Proposal ID: {contract.proposal_id}</p>
        </div>
      </div>
      
      <SignatureDialog
        isOpen={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onSuccess={handleSignatureSuccess}
        contractId={contractId}
        signatureType={signatureType}
      />
      
      <DeleteContractDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteContract}
        contractId={contractId}
      />
    </motion.div>
  );
}