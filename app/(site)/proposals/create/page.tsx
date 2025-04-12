"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared";
import { TemplateSelector } from "@/components/features/create-proposal/template-selector";
import { VariablesForm } from "@/components/features/create-proposal/variables-form";
import { CostCalculation } from "@/components/features/create-proposal/cost-calculation";
import { ProposalPreview } from "@/components/features/create-proposal/proposal-review";
import ProposalDetails from "@/components/features/create-proposal/proposal-details";
import { emptyProposal } from "@/data/proposals";
import { Template, ProposalData, Variable } from "@/types/proposals";

export default function CreateProposalPage() {
  const [currentProposal, setCurrentProposal] =
    useState<ProposalData>(emptyProposal);
  const [activeTab, setActiveTab] = useState("template");

  const handleTemplateSelect = (template: Template) => {
    const initializedVariables = template.parameters.map((variable) => ({
      ...variable,
      value: "0",
    }));

    const newProposal: ProposalData = {
      ...template,
      parameters: initializedVariables, // Make sure to use the initialized variables
    };

    setCurrentProposal(newProposal);
    setActiveTab("details");
  };

  const updateVariables = (updatedVariables: Variable[]) => {
    // Save the updated variables to the proposal state
    setCurrentProposal((prev) => ({
      ...prev,
      parameters: updatedVariables, // Add the updated variables here
    }));

    // Debug log to verify the update
    console.log("Updated variables in parent:", updatedVariables);
  };

  const updateProposal = (updatedProposal: ProposalData) => {
    setCurrentProposal(updatedProposal);
  };

  const handleTabChange = (value: string) => {
    // Save current state before changing tabs
    console.log("Changing tab to:", value);
    console.log("Current proposal state:", currentProposal);
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto px-4 mt-6 mb-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Proposal</h1>
        <p>
          Build a professional proposal for your client by following these steps
        </p>
      </div>
      <div>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="costs">Cost Calculation</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="template">
            <TemplateSelector
              onSelectTemplate={handleTemplateSelect}
              selectedTemplateId={currentProposal.id}
            />
          </TabsContent>

          <TabsContent value="details">
            <ProposalDetails
              proposal={currentProposal}
              onUpdateProposal={updateProposal}
              onNext={() => setActiveTab("variables")}
            />
          </TabsContent>

          <TabsContent value="variables">
            <VariablesForm
              variables={currentProposal.parameters || []}
              setVariables={updateVariables}
              onNext={() => setActiveTab("costs")}
            />
          </TabsContent>
          <TabsContent value="costs">
            <CostCalculation
              proposal={currentProposal}
              onNext={() => setActiveTab("preview")}
              onUpdateProposal={updateProposal}
            />
          </TabsContent>
          <TabsContent value="preview">
            <ProposalPreview proposal={currentProposal} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
