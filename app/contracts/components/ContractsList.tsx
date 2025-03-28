"use client";

import { useState } from "react";
import { Contract } from "@/app/api/apiService";
import { ContractCard } from "./ContractCard";
import { DeleteContractDialog } from "./DeleteContractDialog";
import { SignatureDialog } from "./SignatureDialog";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ContractsListProps {
  contracts: Contract[];
  onRefresh: () => Promise<void>;
}

export function ContractsList({ contracts, onRefresh }: ContractsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [contractToSign, setContractToSign] = useState<number | undefined>(undefined);
  const [signatureType, setSignatureType] = useState<'client' | 'contractor' | undefined>(undefined);

  // Handle delete contract
  const handleDeleteContract = (id: number) => {
    setContractToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Handle sign contract
  const handleSignContract = (id: number, type: 'client' | 'contractor') => {
    setContractToSign(id);
    setSignatureType(type);
    setSignDialogOpen(true);
  };

  // Handle refresh after delete or sign
  const handleSuccess = async () => {
    await onRefresh();
    toast.success("Contracts updated successfully");
  };

  return (
    <>
      {/* Grid container for cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-8">
        {contracts.map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onDelete={handleDeleteContract}
            onSign={handleSignContract}
          />
        ))}
      </div>

      {/* Empty state when no contracts match filters */}
      {contracts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 mt-8"
        >
          <div className="mx-auto w-full max-w-md p-6 bg-background border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">No Contracts Found</h3>
            <p className="text-muted-foreground mb-4">
              No contracts match your current filters or search criteria.
            </p>
          </div>
        </motion.div>
      )}

      {/* Delete Dialog */}
      <DeleteContractDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleSuccess}
        contractId={contractToDelete}
      />

      {/* Signature Dialog */}
      <SignatureDialog
        isOpen={signDialogOpen}
        onClose={() => setSignDialogOpen(false)}
        onSuccess={handleSuccess}
        contractId={contractToSign}
        signatureType={signatureType}
      />
    </>
  );
}