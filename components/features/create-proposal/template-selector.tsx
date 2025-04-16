"use client"

import Image from "next/image"
import { CardContent, Badge, Tooltip, TooltipTrigger, TooltipContent } from "@/components/shared"
import { getTemplates } from "@/hooks/api/templates/get-templates"
import { Info } from "lucide-react"

interface TemplateSelectorProps {
  onSelectTemplate: (template: any) => void
  selectedTemplateId: number
}

export function TemplateSelector({ onSelectTemplate, selectedTemplateId }: TemplateSelectorProps) {
  const { templates, isLoading, error } = getTemplates();
  if (isLoading) {
    return <div className="flex justify-center items-center py-16 text-lg text-gray-500 font-medium">Loading templates...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center py-16 text-lg text-red-500 font-medium">Error loading templates: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="mb-6 flex flex-col items-center justify-center gap-2">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          Choose a Template
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 text-xs rounded-full border px-1.5 cursor-pointer">📚</span>
            </TooltipTrigger>
            <TooltipContent>
              <span>Select a template to start your proposal. You can customize it in the next steps.</span>
            </TooltipContent>
          </Tooltip>
        </h2>
        <p className="text-base text-gray-500 font-light max-w-2xl">Select a template to start your proposal. You can customize it in the next steps.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isActive = selectedTemplateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate({ ...template, title: template.name })}
              className={`group h-full w-full text-left rounded-2xl overflow-hidden transition-all duration-200 border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/60 ${
                isActive
                  ? "border-primary/70 shadow-xl ring-2 ring-primary/30 drop-shadow-lg"
                  : "border-zinc-200 dark:border-zinc-700 shadow-none hover:shadow-xl hover:-translate-y-1"
              }`}
              style={{ boxShadow: isActive ? "0 0 0 4px rgba(59,130,246,0.15), 0 8px 32px 0 rgba(0,0,0,0.10)" : undefined }}
            >
              <div className="w-full h-40 relative bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={template.image || "/placeholder-image.jpg"}
                  alt={template.name}
                  fill
                  className="object-cover"
                  style={{ borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
                />
              </div>
              <CardContent className="p-5">
                <h1 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-100 truncate">
                  {template.name}
                </h1>
                <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 min-h-[48px]">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.modules &&
                    template.modules.slice(0, 4).map((module, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="font-semibold uppercase text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                      >
                        {module.name || "Module"}
                      </Badge>
                    ))}
                  {template.modules && template.modules.length > 4 && (
                    <Badge
                      variant="outline"
                      className="font-semibold uppercase text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                    >
                      +{template.modules.length - 4} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                  >
                    <span className="uppercase font-semibold">Parameters</span>
                    <span className="ml-1 h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 flex items-center justify-center px-1">
                      {template.parameters?.length || 0}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                  >
                    <span className="uppercase font-semibold">Modules</span>
                    <span className="ml-1 h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 flex items-center justify-center px-1">
                      {template.modules?.length || 0}
                    </span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs font-medium text-zinc-400">
                    {new Date(template.created_at).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                  {isActive && (
                    <span className="text-xs font-semibold text-primary">Selected</span>
                  )}
                </div>
              </CardContent>
            </button>
          );
        })}
      </div>
    </div>
  );
}

