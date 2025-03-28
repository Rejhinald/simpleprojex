"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useContractContext } from "../contexts/ContractContext";
import { useState } from "react";

interface DeleteContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  contractId: number | null;
}

export function DeleteContractDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  contractId
}: DeleteContractDialogProps) {
  const { deleteContract } = useContractContext();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!contractId) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteContract(contractId);
      if (success) {
        await onConfirm();
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Contract
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this contract? This action cannot be undone, 
            and any associated signatures will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Contract"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}