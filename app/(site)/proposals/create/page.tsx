"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared";
import { Button } from "@/components/shared";
import { TemplateSelector } from "@/components/features/create-proposal/template-selector";
import { VariablesForm } from "@/components/features/create-proposal/variables-form";
import { CostCalculation } from "@/components/features/create-proposal/cost-calculation";
import { ProposalPreview } from "@/components/features/create-proposal/proposal-review";
import ProposalDetails from "@/components/features/create-proposal/proposal-details";
import { emptyProposal } from "@/data/proposals";
import { CreateProposalTour } from "@/components/features/joyride/create-proposal-tour";
import { Info } from "lucide-react";

export default function CreateProposalPage() {
  const [currentProposal, setCurrentProposal] = useState(emptyProposal);
  const [activeTab, setActiveTab] = useState("template");
  const [isTourRunning, setIsTourRunning] = useState(false);

  // Check if user has seen the tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenCreateTemplateTour");
    if (!hasSeenTour) {
      setIsTourRunning(true);
    }
  }, []);

  const handleTemplateSelect = (template: any) => {
    const initializedVariables = template.parameters.map((variable: any) => ({
      ...variable,
      value: 0, 
      formula: variable.formula || "",
      parameter: variable.parameter || null,
    }));

    const newProposal = {
      ...template,
      parameters: initializedVariables,
    };

    setCurrentProposal(newProposal);
    setActiveTab("details");
  };

  const updateVariables = (updatedVariables: any) => {
    setCurrentProposal((prev) => ({
      ...prev,
      parameters: updatedVariables,
    }));
  };

  const updateProposal = (updatedProposal: any) => {
    setCurrentProposal(updatedProposal);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const startTour = () => {
    setIsTourRunning(true);
    setActiveTab("template");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e5e7eb] flex flex-col py-4 px-4">
      {/* Include the Tour component */}
      <CreateProposalTour
        isRunning={isTourRunning}
        setIsRunning={setIsTourRunning}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="w-full max-w-8xl mx-auto flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-4">
            Create New Proposal
          </h1>
          <p className="text-base text-gray-500 font-light max-w-2xl mx-auto mt-2">
            Build a professional proposal for your client by following these
            steps.
          </p>
        </div>

        {/* Optional: Add a button to manually trigger the tour */}
        <Button
          onClick={startTour}
          variant="outline"
          size="sm"
          className="absolute top-6 right-6 h-10 px-4 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-md z-50"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            Tour Guide
          </span>
        </Button>

        <div className="rounded-2xl shadow-md bg-white/90 backdrop-blur-md p-6 flex-1 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full h-full flex flex-col"
          >
            <TabsList className="flex w-full mb-6 rounded-xl bg-gray-100 p-1 h-12">
              <TabsTrigger
                value="template"
                className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black text-gray-500 transition-all"
              >
                Template
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black text-gray-500 transition-all"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="variables"
                className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black text-gray-500 transition-all"
              >
                Variables
              </TabsTrigger>
              <TabsTrigger
                value="costs"
                className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black text-gray-500 transition-all"
              >
                Cost Calculation
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black text-gray-500 transition-all"
              >
                Preview
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent
                value="template"
                className="h-full template-tab-content"
              >
                <TemplateSelector
                  onSelectTemplate={handleTemplateSelect}
                  selectedTemplateId={currentProposal.id}
                />
              </TabsContent>
              <TabsContent
                value="details"
                className="h-full details-tab-content"
              >
                <ProposalDetails
                  proposal={currentProposal}
                  onUpdateProposal={updateProposal}
                  onNext={() => setActiveTab("variables")}
                />
              </TabsContent>
              <TabsContent
                value="variables"
                className="h-full parameters-tab-content"
              >
                <VariablesForm
                  parameters={currentProposal.parameters || []}
                  setParameters={updateVariables}
                  onNext={() => setActiveTab("costs")}
                />
              </TabsContent>
              <TabsContent
                value="costs"
                className="h-full categories-tab-content"
              >
                <CostCalculation
                  proposal={currentProposal}
                  onNext={() => setActiveTab("preview")}
                  onUpdateProposal={updateProposal}
                />
              </TabsContent>
              <TabsContent
                value="preview"
                className="h-full preview-tab-content"
              >
                <ProposalPreview proposal={currentProposal} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}