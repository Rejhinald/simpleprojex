"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
} from "@/components/shared";
import type { ProposalData, Variable, Category, ProposalElement } from "@/types/proposals";
import { calculateCost } from "@/helpers/calculate-cost";
import {
  PrinterIcon,
  DownloadIcon,
  MailIcon,
  CheckCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { useMemo } from "react";
import { useCreateProposal } from "@/hooks/api/proposals/create-proposal";

interface ProposalPreviewProps {
  proposal: ProposalData;
}

export function ProposalPreview({ proposal }: ProposalPreviewProps) {
  const router = useRouter();
  const { createProposal, isLoading, error } = useCreateProposal();
  const [isSaving, setIsSaving] = useState(false);
  console.log(proposal);
  const handleSaveProposal = async () => {
    setIsSaving(true);
    
    try {
      const result = await createProposal(proposal);
      
      if (result.success) {
        alert("Success! Your proposal has been saved successfully.");
        
        // Redirect to proposals list or the new proposal page
        setTimeout(() => {
          router.push('/proposals');
        }, 1500);
      } else {
        alert(result.error || "Failed to save proposal. Please try again.");
      }
    } catch (err) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const calculatedCosts = useMemo(() => {
    return proposal.modules.map((category: Category) => ({
      ...category,
      elements: proposal.template_elements.map((element: ProposalElement) => {
        const materialCost = calculateCost(
          element.material_cost.toString(),
          proposal.parameters
        );
        const laborCost = calculateCost(element.labor_cost.toString(), proposal.parameters);
        const baseCost = materialCost + laborCost;

        // Use global markup if enabled, otherwise use element's markup (or default to 10%)
        const markupPercentage = proposal.useGlobalMarkup
          ? proposal.globalMarkupPercentage || 15
          : element.markup_percentage || 10;

        const markupAmount = baseCost * (markupPercentage / 100);

        return {
          ...element,
          calculatedMaterialCost: materialCost,
          calculatedLaborCost: laborCost,
          markupPercentage: markupPercentage,
          markupAmount: markupAmount,
          totalWithMarkup: baseCost + markupAmount,
        };
      }),
    }));
  }, [proposal]);

  const totalMaterialCost = calculatedCosts.reduce((total: number, category: any) => {
    return (
      total +
      category.elements.reduce((catTotal: number, element: any) => {
        return catTotal + (element.calculatedMaterialCost || 0);
      }, 0)
    );
  }, 0);

  const totalLaborCost = calculatedCosts.reduce((total: number, category: any) => {
    return (
      total +
      category.elements.reduce((catTotal: number, element: any) => {
        return catTotal + (element.calculatedLaborCost || 0);
      }, 0)
    );
  }, 0);

  const totalMarkupAmount = calculatedCosts.reduce((total: number, category: any) => {
    return (
      total +
      category.elements.reduce((catTotal: number, element: any) => {
        return catTotal + (element.markupAmount || 0);
      }, 0)
    );
  }, 0);

  const grandTotalWithMarkup = totalMaterialCost + totalLaborCost + totalMarkupAmount;

  return (
    <div>
      <div className="container mx-auto px-4">
        {/* Show error message if API call fails */}
        {error && (
          <div className="bg-destructive/20 border border-destructive rounded-md p-3 text-destructive mt-4">
            {error}
          </div>
        )}
        
        {/* Full-width image at the top */}
        <div className="relative w-full h-[300px] mt-6 mb-6 overflow-hidden rounded-xl">
          <Image
            src={proposal.imageUrl || "/placeholder-image.jpg"}
            alt={proposal.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="gap-1">
            <PrinterIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <DownloadIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <MailIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </Button>
          <Button 
            className="gap-2" 
            onClick={handleSaveProposal}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircleIcon className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Proposal"}
          </Button>
        </div>
      </div>
      
      {/* Show error message if API call fails */}
      {error && (
        <div className="bg-destructive/20 border border-destructive rounded-md p-3 text-destructive">
          {error}
        </div>
      )}
      
      <div className="flex flex-col justify-center max-w-7xl mx-auto">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex flex-col gap-8 p-8">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/logo.svg"
                    alt="Company Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <h2 className="text-2xl font-bold">Simple Projex</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  123 Construction Ave, Building City, ST 12345
                </p>
                <p className="text-sm text-muted-foreground">
                  contact@simpleprojex.com | (555) 123-4567
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">
                  Proposal # {new Date().getFullYear()}-
                  {String(proposal.id).padStart(4, "0")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Date: {proposal.created_at}
                </p>
                <p className="text-sm text-muted-foreground">
                  Valid until:{" "}
                  {
                    new Date(new Date().setDate(new Date().getDate() + 30))
                      .toISOString()
                      .split("T")[0]
                  }
                </p>
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <h1 className="text-3xl font-bold">{proposal.title}</h1>
              <p className="mt-2 text-muted-foreground">
                Prepared for: {proposal.clientName} | {proposal.clientEmail} |{" "}
                {proposal.clientPhone}
              </p>
            </div>
            <div className="relative mx-auto h-64 w-full max-w-3xl overflow-hidden rounded-lg">
              <Image
                src={proposal.imageUrl || "/placeholder.svg"}
                alt={proposal.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="w-full max-w-4xl mx-auto">
                <p className="text-muted-foreground text-center text-xl ">
                  {proposal.description}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Cost Breakdown</h3>
              {calculatedCosts.map((category) => (
                <div key={category.id} className="space-y-3">
                  <h4 className="flex items-center gap-2 text-lg font-bold">
                    <CheckCircleIcon className="h-4 w-4 text-primary" />
                    {category.name}
                  </h4>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[20%]">Elements</TableHead>
                          <TableHead className="w-[20%]">
                            Material Cost <span className="text-xs font-normal">(Formula)</span>
                          </TableHead>
                          <TableHead className="w-[20%]">
                            Labor Cost <span className="text-xs font-normal">(Formula)</span>
                          </TableHead>
                          <TableHead className="text-right">Base Total</TableHead>
                          <TableHead className="text-right">Markup %</TableHead>
                          <TableHead className="text-right">Total with Markup</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.elements.map((element) => (
                          <TableRow key={element.id}>
                            <TableCell className="font-medium">
                              {element.name}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-mono">
                                  ${element.calculatedMaterialCost?.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Formula: {element.material_cost}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-mono">
                                  ${element.calculatedLaborCost?.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Formula: {element.labor_cost}
</div>
                                </div>
                              </TableCell>
                            <TableCell className="text-right font-medium font-mono">
                              $
                              {(
                                (element.calculatedMaterialCost || 0) +
                                (element.calculatedLaborCost || 0)
                              ).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {element.markupPercentage}%
                              {proposal.useGlobalMarkup && (
                                <div className="text-xs text-muted-foreground">
                                  (Global)
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium font-mono">
                              ${element.totalWithMarkup?.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Variables Used in Calculations
              </h3>
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Group variables by type */}
                  {Object.entries(
                    proposal.parameters.reduce((acc, variable) => {
                      acc[variable.type] = acc[variable.type] || [];
                      acc[variable.type].push(variable);
                      return acc;
                    }, {} as Record<string, Variable[]>)
                  ).map(([type, vars]) => (
                    <div key={type} className="space-y-2">
                      <h4 className="font-semibold text-md">{type}</h4>
                      <div className="space-y-1">
                        {vars.map((variable) => (
                          <div
                            key={variable.id}
                            className="flex justify-between bg-muted/30 p-2 rounded-md"
                          >
                            <span>{variable.name}:</span>
                            <span className="font-mono">
                              {variable.value || "0"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar - right side (1 column on medium screens and above) */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Client Name</p>
                    <p className="font-medium">{proposal.clientName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{proposal.clientEmail}</p>
                  </div>
                  {proposal.clientPhone && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{proposal.clientPhone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Proposal Summary Card */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Proposal Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Total Material Cost
                      </span>
                      <span className="font-mono font-medium">
                        ${totalMaterialCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Labor Cost</span>
                      <span className="font-mono font-medium">
                        ${totalLaborCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Markup</span>
                      <span className="font-mono font-medium">
                        ${totalMarkupAmount.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-medium">Grand Total</span>
                      <span className="text-xl font-mono font-bold">
                        ${grandTotalWithMarkup.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
