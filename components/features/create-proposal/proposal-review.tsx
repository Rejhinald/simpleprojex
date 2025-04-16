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
import { toast } from "sonner";
import { ProposalData } from "@/types/create-proposal";
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
import { Module, ProjectElement, ProjectParameter } from "@/types/proposals";

interface ProposalPreviewProps {
  proposal: ProposalData;
}

export function ProposalPreview({ proposal }: ProposalPreviewProps) {
  const router = useRouter();
  const { createProposal, isLoading, error } = useCreateProposal();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProposal = async () => {
    setIsSaving(true);
    try {
      const result = await createProposal(proposal);

      if (result.success) {
        console.log("Proposal saved successfully:", proposal);
        toast.success("Success! Your proposal has been saved successfully.", {
          duration: 3000,
          position: "top-center",
        });

        setTimeout(() => {
          router.push("/proposals");
        }, 1000);
      } else {
        toast.error(
          result.error || "Failed to save proposal. Please try again.",
          {
            duration: 5000,
            position: "top-center",
          }
        );
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calculatedCosts = useMemo(() => {
    if (!calculateCost) return [];
    // Use the same logic as cost-calculation.tsx for accurate totals
    const elementsByCategory = (proposal.modules || []).reduce(
      (acc, module) => {
        const categoryId = module.id;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        const categoryElements = proposal.template_elements.filter(
          (element) => element.module.id === categoryId
        );
        acc[categoryId] = categoryElements;
        return acc;
      },
      {} as Record<number, typeof proposal.template_elements>
    );

    return proposal.modules.map((category) => {
      const elements = elementsByCategory[category.id] || [];
      return {
        ...category,
        elements: elements.map((templateElement) => {
          const materialFormula = templateElement.element.formula || templateElement.material_cost || "0";
          const laborFormula = templateElement.element.labor_formula || templateElement.labor_cost || "0";
          const markupString = templateElement.markup || "0";
          const markup = parseFloat(markupString) || 0;

          const materialCost = calculateCost(materialFormula, proposal.parameters);
          const laborCost = calculateCost(laborFormula, proposal.parameters);
          const baseCost = materialCost + laborCost;
          const markupPercentage = proposal.useGlobalMarkup
            ? proposal.globalMarkupPercentage || 15
            : markup;
          const markupAmount = baseCost * (markupPercentage / 100);

          return {
            ...templateElement,
            calculatedMaterialCost: materialCost,
            calculatedLaborCost: laborCost,
            markup: markupString,
            markupPercentage,
            markupAmount,
            totalWithMarkup: baseCost + markupAmount,
            material_cost: materialFormula,
            labor_cost: laborFormula,
          };
        }),
      };
    });
  }, [proposal]);

  // Use the same summary logic as cost-calculation
  const totalMaterialCost = useMemo(() => {
    return calculatedCosts.reduce((total, category) => {
      return (
        total +
        category.elements.reduce((catTotal, element) => {
          return catTotal + (element.calculatedMaterialCost || 0);
        }, 0)
      );
    }, 0);
  }, [calculatedCosts]);

  const totalLaborCost = useMemo(() => {
    return calculatedCosts.reduce((total, category) => {
      return (
        total +
        category.elements.reduce((catTotal, element) => {
          return catTotal + (element.calculatedLaborCost || 0);
        }, 0)
      );
    }, 0);
  }, [calculatedCosts]);

  const totalMarkupAmount = useMemo(() => {
    return calculatedCosts.reduce((total, category) => {
      return (
        total +
        category.elements.reduce((catTotal, element) => {
          return catTotal + (element.markupAmount || 0);
        }, 0)
      );
    }, 0);
  }, [calculatedCosts]);

  const grandTotalWithMarkup = totalMaterialCost + totalLaborCost + totalMarkupAmount;

  return (
  <div className="space-y-8">
    <div className="mb-2 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Proposal Preview
      </h2>
      <p className="text-base text-gray-500 font-light">
        Review your proposal before saving and sending to your client.
      </p>
    </div>
    <Card className="rounded-2xl shadow-lg border-0 p-8">
      <CardContent className="p-0 space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              {proposal.name || "Untitled Proposal"}
            </h1>
            <div className="text-xs text-gray-400 font-light">
              Created on{" "}
              {proposal.created_at
                ? new Date(proposal.created_at).toLocaleDateString()
                : "-"}
            </div>
          </div>
          <div className="flex gap-3 flex-wrap justify-end">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-xl px-5 py-2 text-base font-semibold"
            >
              Back
            </Button>
            <Button
              onClick={handleSaveProposal}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl px-5 py-2 text-base font-semibold bg-green-800 text-white hover:bg-green-900 transition-all shadow-md"
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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Description</h2>
          <div className="prose prose-slate max-w-none text-base">
            {proposal.description ? (
              proposal.description.split("\n").map((paragraph, index) => (
                <p key={index} className="text-base/relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-400">No description provided.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Cost Breakdown
          </h2>
          {calculatedCosts.map((category) => (
            <Card
              key={category.id}
              className="overflow-hidden rounded-xl border bg-gray-50 mb-6"
            >
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-center text-gray-800">
                  {category.name}
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[20%]">Elements</TableHead>
                        <TableHead className="w-[20%]">
                          Material Cost{" "}
                          <span className="text-xs font-normal">
                            (Formula)
                          </span>
                        </TableHead>
                        <TableHead className="w-[20%]">
                          Labor Cost{" "}
                          <span className="text-xs font-normal">
                            (Formula)
                          </span>
                        </TableHead>
                        <TableHead className="text-right">Base Total</TableHead>
                        <TableHead className="text-right">Markup %</TableHead>
                        <TableHead className="text-right">
                          Total with Markup
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.elements.map((element) => (
                        <TableRow key={element.id}>
                          <TableCell className="font-medium">
                            {element.element.name}
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
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Variables Used in Calculations
          </h2>
          <div className="rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(
                proposal.parameters.reduce((acc, variable) => {
                  acc[variable.type] = acc[variable.type] || [];
                  acc[variable.type].push(variable);
                  return acc;
                }, {} as Record<string, ProjectParameter[]>)
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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Proposal Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
              <span className="text-muted-foreground">
                Total Material Cost
              </span>
              <span className="font-mono font-bold text-lg">
                ${totalMaterialCost.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
              <span className="text-muted-foreground">Total Labor Cost</span>
              <span className="font-mono font-bold text-lg">
                ${totalLaborCost.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
              <span className="text-muted-foreground">Total Markup</span>
              <span className="font-mono font-bold text-lg">
                ${totalMarkupAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center bg-primary/10 rounded-xl p-4">
              <span className="text-lg font-semibold">Grand Total</span>
              <span className="font-mono font-bold text-2xl">
                ${grandTotalWithMarkup.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  );
}
