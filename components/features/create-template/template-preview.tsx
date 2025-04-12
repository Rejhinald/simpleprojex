"use client";

import { Button, Card, Separator } from "@/components/shared";
import { useState, useEffect } from "react";
import { Check, FileText, ArrowLeft, Code } from "lucide-react";
import { Template, TemplatePreviewProps } from "@/types/templates";
import { postTemplate } from "@/hooks/api/templates/post-template";

export default function TemplatePreview({
  template,
  onPrevious,
  onSave,
}: TemplatePreviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  // Format the template data as JSON for display
  const formattedJson = JSON.stringify(template, null, 2);

  // Group elements by category
  const elementsByCategory = template.categories.reduce((acc, category) => {
    acc[category.name] = category.elements;
    return acc;
  }, {} as Record<string, any[]>);

  // Handle image preview
  useEffect(() => {
    // Clear previous URL if any
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    // Generate preview URL from the image
    if (template.image) {
      if (typeof template.image === "string") {
        setImagePreviewUrl(template.image);
      } else if (template.image instanceof File) {
        const objectUrl = URL.createObjectURL(template.image);
        setImagePreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    } else {
      setImagePreviewUrl("/placeholder-image.jpg");
    }
  }, [template.image]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Use the same postTemplate function as in CreateTemplatePage
      await postTemplate(template);
      console.log("Saving template:", template);

      if (onSave) {
        onSave();
      }

      setIsSaved(true);

      // Add redirect after successful save
      window.location.href = "http://localhost:3000/templates";
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Banner image */}
      <div className="relative w-full h-[250px] overflow-hidden rounded-xl mb-6">
        <img
          src={imagePreviewUrl || "/placeholder-image.jpg"}
          alt={template.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-8 pb-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {template.title || "Untitled Template"}
            </h1>
            <div className="text-sm text-gray-500">
              Created on {new Date(template.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-3">
            {onPrevious && (
              <Button
                variant="outline"
                onClick={onPrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            )}

            <Button
              onClick={() => setShowJson(!showJson)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Code size={16} />
              {showJson ? "Hide JSON" : "View JSON"}
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className="flex items-center gap-2"
            >
              {isSaved ? (
                <>
                  <Check size={16} />
                  Saved
                </>
              ) : (
                <>
                  <FileText size={16} />
                  {isSaving ? "Saving..." : "Save Template"}
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>
          <div className="prose prose-slate max-w-none">
            {template.description ? (
              template.description.split("\n").map((paragraph, index) => (
                <p key={index} className="text-base/relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-500">No description provided.</p>
            )}
          </div>
        </div>

        {/* Template Elements */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Template Elements</h2>

          {Object.keys(elementsByCategory).length > 0 ? (
            Object.entries(elementsByCategory).map(
              ([categoryName, elements]) => (
                <div key={categoryName} className="border rounded-lg shadow-sm">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-center">
                      {categoryName}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium">
                              Element
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium">
                              Material Formula
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium">
                              Labor Formula
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {elements.map((element, idx) => (
                            <tr
                              key={element.id}
                              className={`border-b ${
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="py-3 px-4">
                                <span className="font-medium">
                                  {element.name}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <code className="font-mono bg-gray-100 p-1 rounded text-sm">
                                  {element.material_cost}
                                </code>
                              </td>
                              <td className="py-3 px-4">
                                <code className="font-mono bg-gray-100 p-1 rounded text-sm">
                                  {element.labor_cost}
                                </code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            )
          ) : (
            <p className="text-gray-500">
              No elements defined for this template.
            </p>
          )}
        </div>

        {/* Variables */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Variables</h2>
          <p className="text-gray-500 text-sm">
            Template dimensions and parameters
          </p>

          {template.variables.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {template.variables.map((variable, idx) => (
                <div
                  key={idx}
                  className="flex justify-between w-[250px] items-center p-3 bg-gray-50 rounded-xl"
                >
                  <span className="font-medium">{variable.name}</span>
                  <span className="text-gray-500">{variable.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No variables defined for this template.
            </p>
          )}
        </div>

        {/* JSON View */}
        {showJson && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Template JSON</h2>
            <pre className="p-4 bg-gray-100 rounded-md text-sm overflow-auto max-h-[400px]">
              {formattedJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
