"use client";

import React, { use } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge, Separator } from "@/components/shared";
import { getTemplateById } from "@/hooks/api/templates/get-template-id";
import {
  getTemplateElements,
  TemplateElement,
} from "@/hooks/api/templates/get-template-elements";
import Link from "next/link";

export default function TemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    template,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = getTemplateById(id);
  const {
    elements,
    isLoading: isLoadingElements,
    error: elementsError,
  } = getTemplateElements(id);

console.log(template)
console.log(elements)
  const error = templateError || elementsError;
  const isLoading = isLoadingTemplate || isLoadingElements;

  if (error) {
    console.error("Error loading template:", error);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">Loading template...</div>
    );
  }

  if (!template) {
    notFound();
  }

  const elementsByModule = elements.reduce((acc, element) => {
    const module = element.module;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(element);
    return acc;
  }, {} as Record<string, TemplateElement[]>);

  return (
    <div>
      <div className="container mx-auto px-4">
        <div className="relative w-full h-[300px] mt-6 mb-6 overflow-hidden rounded-xl">
          <Image
            src={template.image || "/placeholder-image.jpg"}
            alt={template.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="space-y-8 pb-20">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                {template.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-sm">
                <span>
                  Created on{" "}
                  {new Date(template.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/proposals/create`}>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-md font-medium">
                  Create Proposal
                </button>
              </Link>
              <button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 py-2 rounded-md font-medium">
                Edit Template
              </button>
              <button className="border hover:bg-muted px-5 py-2 rounded-md font-medium">
                Download
              </button>
            </div>
          </div>
          <Separator className="my-4" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Description</h2>
            <div className="prose prose-slate max-w-none">
              {template.description.split("\n").map((paragraph) => (
                <p key={paragraph.slice(0, 20)} className="text-base/relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Template Elements</h2>
            {Object.entries(elementsByModule).map(
              ([moduleName, moduleElements]) => (
                <div
                  key={moduleName}
                  className="card border rounded-lg shadow-sm"
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">
                      {moduleName}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-muted/60">
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
                          {moduleElements.map((element, idx) => (
                            <tr
                              key={element.id}
                              className={`border-b border-muted/40 ${
                                idx % 2 === 0 ? "bg-white" : "bg-muted/20"
                              }`}
                            >
                              <td className="py-3 px-4">
                                <span className="font-medium">
                                  {element.name}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <code className="font-mono bg-muted/50 p-1 rounded text-sm">
                                  {element.material_cost}
                                </code>
                              </td>
                              <td className="py-3 px-4">
                                <code className="font-mono bg-muted/50 p-1 rounded text-sm">
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
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Variables</h2>
            <p className="text-muted-foreground text-sm">
              Template dimensions and parameters
            </p>
            <div className="flex flex-wrap gap-3">
              {template.parameters.map((parameter, idx) => (
                <div
                  key={parameter.id}
                  className="flex justify-between w-[250px] items-center p-3 bg-muted/50 rounded-xl"
                >
                  <span className="font-medium">{parameter.name}</span>
                  <span className="text-muted-foreground">
                    {parameter.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
