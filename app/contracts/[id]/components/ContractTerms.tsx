"use client";

interface ContractTermsProps {
  termsAndConditions: string;
}

export function ContractTerms({ termsAndConditions }: ContractTermsProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg border-b pb-1 mb-2">Terms and Conditions</h3>
      <div className="whitespace-pre-line text-sm">
        {termsAndConditions}
      </div>
    </div>
  );
}