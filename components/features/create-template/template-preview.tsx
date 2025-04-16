"use client";

import { Button, Card } from "@/components/shared";
import { useState, useEffect } from "react";
import { Check, PlusCircle } from "lucide-react";
import { Template, TemplatePreviewProps } from "@/types/templates";
import { postTemplate } from "@/hooks/api/templates/post-template";

export default function TemplatePreview({
  template,
  onPrevious,
  onSave,
}: TemplatePreviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const elementsByCategory = template.modules.reduce((acc, module) => {
    acc[module.name] = module.elements;
    return acc;
  }, {} as Record<string, any[]>);

  // Handle image preview
  useEffect(() => {
    // Clear previous URL if any
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  }, [template.image]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await postTemplate(template);
      if (onSave) {
        onSave();
      }
      setIsSaved(true);
      window.location.href = "/templates";
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Banner image */}
      <div className="relative w-full h-[220px] overflow-hidden rounded-2xl mb-8 shadow-md bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={imagePreviewUrl || "/placeholder-image.jpg"}
          alt={template.name}
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      <Card className="p-8 bg-white shadow-lg rounded-2xl border-0 flex-1 flex flex-col">
        <div className="space-y-8 pb-4 flex-1 flex flex-col">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                {template.name || "Untitled Template"}
              </h1>
              <div className="text-xs text-gray-400 font-light">
                Created on{" "}
                {template.created_at
                  ? new Date(template.created_at).toLocaleDateString()
                  : "-"}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap justify-end">
              {onPrevious && (
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  className="flex items-center gap-2 rounded-xl px-5 py-2 text-base font-semibold"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className="flex items-center gap-2 rounded-xl px-5 py-2 text-base font-semibold bg-green-800 text-white hover:bg-green-900 transition-all shadow-md"
              >
                {isSaved ? (
                  <>
                    <Check size={18} />
                    Saved
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    {isSaving ? "Saving..." : "Save Template"}
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <div className="prose prose-slate max-w-none text-base">
              {template.description ? (
                template.description.split("\n").map((paragraph, index) => (
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
              Template Elements
            </h2>
            {Object.keys(elementsByCategory).length > 0 ? (
              Object.entries(elementsByCategory).map(
                ([categoryName, elements]) => (
                  <div
                    key={categoryName}
                    className="border-0 rounded-xl shadow bg-gray-50 mb-6"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-4 text-center text-gray-800">
                        {categoryName}
                      </h3>
                      <div>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 text-base font-semibold text-gray-700">
                                Element
                              </th>
                              <th className="text-left py-3 px-4 text-base font-semibold text-gray-700">
                                Material Formula
                              </th>
                              <th className="text-left py-3 px-4 text-base font-semibold text-gray-700">
                                Labor Formula
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {elements.map((element, idx) => (
                              <tr
                                key={element.id}
                                className={`border-b ${
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <span className="font-medium text-gray-900">
                                    {element.name}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <code className="font-mono bg-gray-100 p-1 rounded text-base text-gray-700">
                                    {element.formula}
                                  </code>
                                </td>
                                <td className="py-3 px-4">
                                  <code className="font-mono bg-gray-100 p-1 rounded text-base text-gray-700">
                                    {element.labor_formula}
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
              <p className="text-gray-400">
                No elements defined for this template.
              </p>
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Variables</h2>
            <p className="text-gray-400 text-base">
              Template dimensions and parameters
            </p>
            {template.parameters.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {template.parameters.map((parameter, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between w-[260px] items-center p-4 bg-gray-50 rounded-xl shadow"
                  >
                    <span className="font-semibold text-gray-900">
                      {parameter.name}
                    </span>
                    <span className="text-gray-500 text-base">
                      {parameter.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                No variables defined for this template.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
