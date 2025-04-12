"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared";
import TemplateDetails from "@/components/features/create-template/template-details";
import TemplateVariables from "@/components/features/create-template/template-variables";
import TemplateCategories from "@/components/features/create-template/template-categories";
import TemplatePreview from "@/components/features/create-template/template-preview";
import { Template } from "@/types/templates";
import { postTemplate } from "@/hooks/api/templates/post-template";

const emptyTemplate: Template = {
  id: 0,
  title: "",
  description: "",
  categories: [],
  variables: [],
  created_at: new Date().toISOString().split("T")[0],
  image: null as unknown as File,
};

export default function CreateTemplatePage() {
  const [currentTemplate, setCurrentTemplate] =
    useState<Template>(emptyTemplate);
  const [activeTab, setActiveTab] = useState("details");
  const [isSaved, setIsSaved] = useState(false);

  // Debug: log template state changes
  useEffect(() => {
    console.log("Current template state:", currentTemplate);
  }, [currentTemplate]);

  const updateTemplate = (
    updatedTemplate: Template | ((prevTemplate: Template) => Template)
  ) => {
    if (typeof updatedTemplate === "function") {
      setCurrentTemplate((prevState) => {
        const newState = updatedTemplate(prevState);
        return newState;
      });
    } else {
      setCurrentTemplate(updatedTemplate);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSaveTemplate = async () => {
    try {
      await postTemplate(currentTemplate);
      console.log("Saving template:", currentTemplate);
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 mt-6 mb-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Template</h1>
        <p>
          Build a professional template for future proposals by following these
          steps
        </p>
      </div>
      <div>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <TemplateDetails
              template={currentTemplate}
              onUpdateTemplate={updateTemplate}
              onNext={() => setActiveTab("variables")}
            />
          </TabsContent>

          <TabsContent value="variables">
            <TemplateVariables
              variables={currentTemplate.variables}
              onUpdateTemplate={updateTemplate}
              onNext={() => setActiveTab("categories")}
              onPrevious={() => setActiveTab("details")}
            />
          </TabsContent>

          <TabsContent value="categories">
            <TemplateCategories
              template={currentTemplate}
              onUpdateTemplate={updateTemplate}
              onNext={() => setActiveTab("preview")}
              onPrevious={() => setActiveTab("variables")}
            />
          </TabsContent>

          <TabsContent value="preview">
            <TemplatePreview
              template={currentTemplate}
              onPrevious={() => setActiveTab("categories")}
              onSave={handleSaveTemplate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
