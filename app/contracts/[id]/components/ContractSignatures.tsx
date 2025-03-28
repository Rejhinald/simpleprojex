"use client";

import { Button } from "@/components/ui/button";
import { Contract, getSignatureImageUrl } from "../../../api/apiService";
import { PenLine } from "lucide-react";
import { useState } from "react";

interface ContractSignaturesProps {
  contract: Contract;
  onClientSign: () => void;
  onContractorSign: () => void;
}

export function ContractSignatures({
  contract,
  onClientSign,
  onContractorSign
}: ContractSignaturesProps) {
  const [clientImgError, setClientImgError] = useState(false);
  const [contractorImgError, setContractorImgError] = useState(false);

  // Compute URLs and log them to the console
  const clientSignatureUrl = getSignatureImageUrl(contract.client_signature ?? null);
  const contractorSignatureUrl = getSignatureImageUrl(contract.contractor_signature ?? null);
  console.log("Client signature URL:", clientSignatureUrl);
  console.log("Contractor signature URL:", contractorSignatureUrl);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="border-t pt-4">
        <p className="mb-1 font-medium">Client Signature:</p>
        <div className="h-16 border-b border-dashed flex items-end justify-center relative">
          {contract.client_signed_at ? (
            // If signed, show the signature/initials
            <div className="absolute inset-0 flex items-end justify-center">
              {contract.client_signature && !clientImgError ? (
                <img 
                  src={clientSignatureUrl}
                  alt="Client signature" 
                  className="max-h-[60px] max-w-[80%] object-contain mb-1"
                  onError={() => setClientImgError(true)}
                />
              ) : (
                <p className="italic font-medium text-xl mb-1">{contract.client_initials}</p>
              )}
            </div>
          ) : (
            // If not signed, show a sign button (only in non-print mode)
            <div className="absolute inset-0 flex items-center justify-center print:hidden">
              <Button 
                variant="outline" 
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={onClientSign}
              >
                <PenLine className="mr-1 h-3.5 w-3.5" />
                Sign as Client
              </Button>
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
            // If signed, show the signature/initials
            <div className="absolute inset-0 flex items-end justify-center">
              {contract.contractor_signature && !contractorImgError ? (
                <img 
                  src={contractorSignatureUrl}
                  alt="Contractor signature" 
                  className="max-h-[60px] max-w-[80%] object-contain mb-1"
                  onError={() => setContractorImgError(true)}
                />
              ) : (
                <p className="italic font-medium text-xl mb-1">{contract.contractor_initials}</p>
              )}
            </div>
          ) : (
            // If not signed, show a sign button (only in non-print mode)
            <div className="absolute inset-0 flex items-center justify-center print:hidden">
              <Button 
                variant="outline" 
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={onContractorSign}
              >
                <PenLine className="mr-1 h-3.5 w-3.5" />
                Sign as Contractor
              </Button>
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
  );
}
