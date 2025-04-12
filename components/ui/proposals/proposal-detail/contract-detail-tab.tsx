import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Switch,
  Input,
  Textarea,
  Label,
} from "@/components/shared";
import { Download, Mail, Printer } from "lucide-react";
import { Proposal, ProjectElement, ProjectParameter } from "@/types/proposals";
import { calculateCost } from "@/helpers/calculate-cost";
import usePostContractDetails from "@/hooks/api/contracts/post-contract-details";
import getContractById, {
  Contract,
} from "@/hooks/api/contracts/get-contract-by-id";

interface ContractDetailTabProps {
  proposal: Proposal;
  totalAmount: number;
}

const convertParametersToVariables = (parameters: ProjectParameter[]) => {
  return parameters.map((param) => ({
    id: param.parameter.id,
    name: param.parameter.name,
    value: param.value.toString(),
    type: param.parameter.type,
  }));
};

const calculateMaterialCost = (
  element: ProjectElement,
  parameters: ProjectParameter[]
) => {
  const variables = convertParametersToVariables(parameters);
  return Number(calculateCost(element.formula, variables).toFixed(2));
};

const calculateLaborCost = (
  element: ProjectElement,
  parameters: ProjectParameter[]
) => {
  const variables = convertParametersToVariables(parameters);
  return Number(calculateCost(element.labor_formula, variables).toFixed(2));
};

export default function ContractDetailTab({
  proposal,
  totalAmount,
}: ContractDetailTabProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [payloadData, setPayloadData] = useState<any>(null);
  const { postContract, isLoading, isSuccess, error } =
    usePostContractDetails();
  const [contractId, setContractId] = useState<string | null>(null);
  // Initialize the getContractById hook to fetch contract data
  const {
    contract,
    isLoading: isLoadingContract,
    error: contractError,
    fetchContract,
  } = getContractById();

  const [contractData, setContractData] = useState({
    title: "SERVICE AGREEMENT",
    effectiveDate: new Date().toISOString().split("T")[0],
    companyName: "[Company Name]",
    companyAddress: "[Address]",
    clientName: proposal.client_name,
    clientAddress: proposal.address || "[Client Address]",
    timeline: "[Timeline]",
    // Terms and conditions sections
    paymentTermsTitle: "2. PAYMENT TERMS",
    paymentTermsContent: `Client agrees to pay Contractor the total sum of $${totalAmount} for the Services.

Payment schedule:
- Initial deposit: $${(totalAmount * 0.25).toFixed(
      2
    )} (25%) due upon signing this Agreement
- Progress payment: $${(totalAmount * 0.5).toFixed(
      2
    )} (50%) due upon completion of 50% of the project
- Final payment: $${(totalAmount * 0.25).toFixed(
      2
    )} (25%) due upon project completion`,
    timelineTitle: "3. TIMELINE",
    timelineContent: `Contractor estimates that the Services will be completed within [Timeline] from the Effective Date, subject to timely receipt of Client materials and approvals.`,
    changesToScopeTitle: "4. CHANGES TO SCOPE",
    changesToScope:
      "Any changes to the scope of Services must be agreed upon in writing by both parties and may result in additional charges and timeline adjustments.",
    totalAmount: totalAmount,
    initialDeposit: (totalAmount * 0.25).toFixed(2),
    progressPayment: (totalAmount * 0.5).toFixed(2),
    finalPayment: (totalAmount * 0.25).toFixed(2),
    clientSignatureName: "",
    clientSignatureDate: "",
    clientInitials: "",
    clientSignatureImage: "",
    contractorSignatureName: "",
    contractorSignatureDate: "",
    contractorInitials: "",
    contractorSignatureImage: "",
  });

  const transformContractData = () => {
    // Combine all terms and conditions sections into a single formatted string
    const combinedTermsAndConditions = `${contractData.paymentTermsTitle}\n${contractData.paymentTermsContent}\n\n${contractData.timelineTitle}\n${contractData.timelineContent}\n\n${contractData.changesToScopeTitle}\n${contractData.changesToScope}`;

    const payload = [
      {
        contractName: contractData.title,
        contractDescription: `Contract for ${proposal.client_name}`,
        contractDate: new Date(contractData.effectiveDate).toISOString(),
        termsAndConditions: combinedTermsAndConditions,
        clientName: contractData.clientName,
        clientEmail: proposal.client_email || "", // Fixed property name
        clientPhoneNumber: proposal.phone_number || "", // Fixed property name
        clientAddress: contractData.clientAddress,
        clientInitials: contractData.clientInitials
          ? contractData.clientInitials
              .split(" ")
              .map((n) => n[0])
              .join("")
          : "",
        clientImage: "",
        contractorName: contractData.companyName,
        contractorAddress: contractData.companyAddress,
        contractorInitials: contractData.contractorInitials
          ? contractData.contractorInitials
              .split(" ")
              .map((n) => n[0])
              .join("")
          : "",
        contractorImage: "",
        contractElements: proposal.project_elements
          ? proposal.project_elements.map((element) => ({
              id: element.id,
              element: {
                id: element.element.id,
                name: element.element.name,
                description: element.element.description || "",
                module: element.project_module.module,
                created_at: new Date().toISOString(), // Using current date as fallback
                updated_at: new Date().toISOString(), // Using current date as fallback
                image: "", // Removed non-existent property
              },
              contract_module: {
                id: element.project_module.id,
                module: element.project_module.module,
              },
              formula: element.formula,
              labor_formula: element.labor_formula,
              image: "", // Removed non-existent property
            }))
          : [],
        contractModules: proposal.project_modules
          ? proposal.project_modules.map((moduleItem) => ({
              id: moduleItem.id,
              module: moduleItem.module,
            }))
          : [],
      },
    ];
console.log(payload)
    return payload;
  };

  // Handle toggle of edit mode
  const handleEditModeToggle = (checked: boolean) => {
    setIsEditable(checked);

    // If turning off edit mode, transform and log the data
    if (!checked) {
      const payload = transformContractData();
      console.log("Payload data (would send to API):", payload);
      setPayloadData(payload);
    }
  };

  // Update contractId when API call is successful and set contractId from response
  useEffect(() => {
    // Use contract UUID from the proposal if available
    if (proposal?.contract?.uuid) {
      setContractId(proposal.contract.uuid);
      fetchContract(proposal.contract.uuid);
    } else if (isSuccess && payloadData && payloadData[0]?.uuid) {
      // Fallback to response data if proposal doesn't have contract UUID
      setContractId(payloadData[0].uuid);
      fetchContract(payloadData[0].uuid);
    }
  }, [proposal?.contract?.uuid, isSuccess, payloadData, fetchContract]);

  // Update contractData with API contract data if available
  useEffect(() => {
    if (contract) {
      // Update contractData with values from the API response
      setContractData((prevData) => ({
        ...prevData,
        title: contract.contractName || prevData.title,
        effectiveDate: contract.contractDate
          ? new Date(contract.contractDate).toISOString().split("T")[0]
          : prevData.effectiveDate,
        companyName: contract.contractorName || prevData.companyName,
        companyAddress: contract.contractorAddress || prevData.companyAddress,
        clientName: contract.clientName || prevData.clientName,
        clientAddress: contract.clientAddress || prevData.clientAddress,
        // Extract payment terms, timeline, and changes to scope from termsAndConditions
        paymentTermsContent:
          extractSectionContent(contract.termsAndConditions, "PAYMENT TERMS") ||
          prevData.paymentTermsContent,
        timelineContent:
          extractSectionContent(contract.termsAndConditions, "TIMELINE") ||
          prevData.timelineContent,
        changesToScope:
          extractSectionContent(
            contract.termsAndConditions,
            "CHANGES TO SCOPE"
          ) || prevData.changesToScope,
        clientInitials: contract.clientInitials || prevData.clientInitials,
        contractorInitials:
          contract.contractorInitials || prevData.contractorInitials,
      }));
    }
  }, [contract]);

  // Helper function to extract specific sections from terms and conditions
  const extractSectionContent = (
    termsText: string = "",
    sectionName: string
  ): string | null => {
    if (!termsText) return null;

    const sectionRegex = new RegExp(
      `\\d+\\.\\s*${sectionName}(.*?)(?=\\d+\\.\\s*|$)`,
      "s"
    );
    const match = termsText.match(sectionRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="md:col-span-3 space-y-2">
        <div className="flex gap-3 mb-4 justify-end">
          <div className="flex items-center space-x-2">
            <Label htmlFor="edit-mode" className="text-sm font-medium">
              Edit Mode
            </Label>
            <Switch
              id="edit-mode"
              checked={isEditable}
              onCheckedChange={handleEditModeToggle}
            />
          </div>
          <Button>
            <Mail className="mr-1 h-4 w-4" />
            Email Client
          </Button>
          <Button
            onClick={() => {
              const payload = transformContractData();
              postContract(payload);
            }}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Contract"}
          </Button>
        </div>

        {/* Status message */}
        {isSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Contract successfully submitted!
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error.message}
          </div>
        )}

        <div className="flex justify-center">
          <Card className="overflow-hidden max-w-7xl">
            <CardHeader className="pb-4">
              <div className="flex justify-center items-center">
                <div>
                  <CardTitle className="text-center">Contract Draft</CardTitle>
                  <CardDescription className="text-center">
                    This contract is generated based on the proposal details.
                    You can edit it before finalizing.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6 max-w-5xl mx-auto">
                <h2 className="text-2xl font-semibold text-center mb-6">
                  {isEditable ? (
                    <Input
                      defaultValue={contractData.title}
                      className="text-2xl font-semibold text-center"
                      onChange={(e) =>
                        setContractData({
                          ...contractData,
                          title: e.target.value,
                        })
                      }
                    />
                  ) : (
                    contractData.title
                  )}
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-base/relaxed">
                    This Service Agreement (the "Agreement") is entered into as
                    of{" "}
                    {new Date(contractData.effectiveDate).toLocaleDateString()}{" "}
                    (the "Effective Date"), by and between:
                  </p>
                  <p className="text-base/relaxed mt-6">
                    <strong>Service Provider:</strong>{" "}
                    {isEditable ? (
                      <Input
                        defaultValue={contractData.companyName}
                        className="inline-block w-auto mx-1"
                        onChange={(e) =>
                          setContractData({
                            ...contractData,
                            companyName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      contractData.companyName
                    )}
                    , with its principal place of business at{" "}
                    {contractData.companyAddress} ("Contractor"), and
                  </p>
                  <p className="text-base/relaxed mt-3">
                    <strong>Client:</strong> {contractData.clientName}, with a
                    primary address at{" "}
                    {isEditable ? (
                      <Input
                        defaultValue={contractData.clientAddress}
                        className="inline-block w-auto mx-1"
                        onChange={(e) =>
                          setContractData({
                            ...contractData,
                            clientAddress: e.target.value,
                          })
                        }
                      />
                    ) : (
                      contractData.clientAddress
                    )}{" "}
                    ("Client").
                  </p>

                  <h3 className="text-lg font-semibold mt-8">
                    1. SCOPE OF SERVICES
                  </h3>
                  <p className="text-base/relaxed">
                    Contractor agrees to provide Client with the following
                    services (the "Services") as detailed in Proposal #{" "}
                    {proposal.id} dated{" "}
                    {new Date(proposal.created_at).toLocaleDateString()}:
                  </p>
                  {proposal.project_modules &&
                    proposal.project_modules.length > 0 && (
                      <div className="my-6">
                        {proposal.project_modules.map((moduleItem) => (
                          <div key={moduleItem.id} className="mb-6">
                            <h4 className="font-medium mb-2">
                              {moduleItem.module.name}
                            </h4>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Element</TableHead>
                                    <TableHead>Material Formula</TableHead>
                                    <TableHead>Labor Formula</TableHead>
                                    <TableHead className="text-right">
                                      Material Cost
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Labor Cost
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Total
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Markup
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Total with Markup
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {proposal.project_elements
                                    .filter(
                                      (element) =>
                                        element.project_module.module.id ===
                                        moduleItem.module.id
                                    )
                                    .map((element) => (
                                      <TableRow key={element.id}>
                                        <TableCell className="font-medium">
                                          {element.element.name}
                                        </TableCell>
                                        <TableCell>{element.formula}</TableCell>
                                        <TableCell>
                                          {element.labor_formula}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          $
                                          {calculateMaterialCost(
                                            element,
                                            proposal.project_parameters
                                          ).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          $
                                          {calculateLaborCost(
                                            element,
                                            proposal.project_parameters
                                          ).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          $
                                          {(
                                            calculateMaterialCost(
                                              element,
                                              proposal.project_parameters
                                            ) +
                                            calculateLaborCost(
                                              element,
                                              proposal.project_parameters
                                            )
                                          ).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {element.markup}%
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          $
                                          {(
                                            (calculateMaterialCost(
                                              element,
                                              proposal.project_parameters
                                            ) +
                                              calculateLaborCost(
                                                element,
                                                proposal.project_parameters
                                              )) *
                                            (1 + element.markup / 100)
                                          ).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {proposal.project_parameters &&
                    proposal.project_parameters.length > 0 && (
                      <div className="my-6">
                        <h4 className="font-medium mb-2">Project Parameters</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Parameter</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Category</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {proposal.project_parameters.map((param) => (
                                <TableRow key={param.id}>
                                  <TableCell className="font-medium">
                                    {param.parameter.name}
                                  </TableCell>
                                  <TableCell>{param.value}</TableCell>
                                  <TableCell>
                                    {param.parameter.type}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                  {/* Terms and Conditions Sections - Individually Editable */}

                  {/* 2. Payment Terms */}
                  {isEditable ? (
                    <div className="mb-6">
                      <Input
                        defaultValue={contractData.paymentTermsTitle}
                        className="text-lg font-semibold mt-8 mb-2"
                        onChange={(e) =>
                          setContractData({
                            ...contractData,
                            paymentTermsTitle: e.target.value,
                          })
                        }
                      />
                      <Textarea
                        defaultValue={contractData.paymentTermsContent}
                        className="min-h-[120px] mt-2"
                        onChange={(e) =>
                          setContractData({
                            ...contractData,
                            paymentTermsContent: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mt-8">
                        {contractData.paymentTermsTitle}
                      </h3>
                      <div className="whitespace-pre-line">
                        {contractData.paymentTermsContent}
                      </div>
                    </>
                  )}

                  {/* 3. Timeline */}
                  {isEditable ? (
                    <div className="mb-6">
                      <Input
                        defaultValue={contractData.timelineTitle}
                        className="text-lg font-semibold mt-8 mb-2"
                        onChange={(e) =>
                          setContractData({
                            ...contractData,
                            timelineTitle: e.target.value,
                          })
                        }
                      />
                      <Textarea
                        defaultValue={contractData.timelineContent}
                        className="min-h-[80px] mt-2"
                        onChange={(e) =>
                          setContractData({
                            ...contractData,
                            timelineContent: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mt-8">
                        {contractData.timelineTitle}
                      </h3>
                      <div className="whitespace-pre-line">
                        {contractData.timelineContent}
                      </div>
                    </>
                  )}

                  {/* 4. Changes to Scope */}
                  {isEditable ? (
                    <div className="mb-6">
                      <Input
                        defaultValue={contractData.changesToScopeTitle}
                        className="text-lg font-semibold mt-8 mb-2"
                        onChange={(e) =>
                          setContractData({
                            ...contractData,
                            changesToScopeTitle: e.target.value,
                          })
                        }
                      />
                      <Textarea
                        defaultValue={contractData.changesToScope}
                        className="min-h-[80px] mt-2"
                        onChange={(e) =>
                          setContractData({
                            ...contractData,
                            changesToScope: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mt-8">
                        {contractData.changesToScopeTitle}
                      </h3>
                      <div className="whitespace-pre-line">
                        {contractData.changesToScope}
                      </div>
                    </>
                  )}

                  <div className="mt-12 border-t pt-8">
                    <p className="font-medium mb-4">
                      <strong>CLIENT:</strong> {contractData.clientName}
                    </p>

                    <div className="mt-6">
                      <p>By:</p>
                      {isEditable ? (
                        <div className="mt-2 space-y-4">
                          <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                              <Label>Initials</Label>
                              <Input
                                defaultValue={contractData.clientInitials}
                                className="w-full max-w-[100px] mt-1"
                                maxLength={5}
                                onChange={(e) => {
                                  setContractData({
                                    ...contractData,
                                    clientInitials: e.target.value,
                                    clientSignatureDate:
                                      new Date().toISOString(),
                                  });
                                }}
                              />
                            </div>

                            <div className="flex-1">
                              <Label>Or Upload Signature Image</Label>
                              <Input
                                type="file"
                                className="w-full max-w-xs mt-1"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setContractData({
                                        ...contractData,
                                        clientSignatureImage: event.target
                                          ?.result as string,
                                        clientSignatureDate:
                                          new Date().toISOString(),
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          {contractData.clientSignatureImage ? (
                            <img
                              src={contractData.clientSignatureImage}
                              alt="Client Signature"
                              className="max-h-16 border-b border-gray-300"
                            />
                          ) : contractData.clientInitials ? (
                            <div className="text-2xl italic font-semibold border-b border-gray-300 max-w-[150px] pb-1">
                              {contractData.clientInitials}
                            </div>
                          ) : (
                            <div className="border-b border-gray-300 w-48">
                              &nbsp;
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="mt-3">
                      Date:{" "}
                      {contractData.clientSignatureDate
                        ? new Date(
                            contractData.clientSignatureDate
                          ).toLocaleDateString()
                        : "_____________________________"}
                    </p>

                    <p className="font-medium mt-10 mb-4">
                      <strong>CONTRACTOR:</strong>{" "}
                      {isEditable ? (
                        <Input
                          defaultValue={contractData.companyName}
                          className="inline-block w-auto mx-1"
                          onChange={(e) =>
                            setContractData({
                              ...contractData,
                              companyName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        contractData.companyName
                      )}
                    </p>

                    <div className="mt-6">
                      <p>By:</p>
                      {isEditable ? (
                        <div className="mt-2 space-y-4">
                          <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                              <Label>Initials</Label>
                              <Input
                                defaultValue={contractData.contractorInitials}
                                className="w-full max-w-[100px] mt-1"
                                maxLength={5}
                                onChange={(e) => {
                                  // Set both initials and current date
                                  setContractData({
                                    ...contractData,
                                    contractorInitials: e.target.value,
                                    contractorSignatureDate:
                                      new Date().toISOString(),
                                  });
                                }}
                              />
                            </div>

                            <div className="flex-1">
                              <Label>Or Upload Signature Image</Label>
                              <Input
                                type="file"
                                className="w-full max-w-xs mt-1"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setContractData({
                                        ...contractData,
                                        contractorSignatureImage: event.target
                                          ?.result as string,
                                        contractorSignatureDate:
                                          new Date().toISOString(),
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          {contractData.contractorSignatureImage ? (
                            <img
                              src={contractData.contractorSignatureImage}
                              alt="Contractor Signature"
                              className="max-h-16 border-b border-gray-300"
                            />
                          ) : contractData.contractorInitials ? (
                            <div className="text-2xl italic font-semibold border-b border-gray-300 max-w-[150px] pb-1">
                              {contractData.contractorInitials}
                            </div>
                          ) : (
                            <div className="border-b border-gray-300 w-48">
                              &nbsp;
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="mt-3">
                      Date:{" "}
                      {contractData.contractorSignatureDate
                        ? new Date(
                            contractData.contractorSignatureDate
                          ).toLocaleDateString()
                        : "_____________________________"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
