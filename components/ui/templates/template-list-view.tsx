import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/shared";
import { getTemplates } from "@/hooks/api/templates/get-templates";
import { TemplateProps } from "@/types/templates";
import { ListLoader } from "@/components/loader/list-loader";
import Link from "next/link";
import Image from "next/image";

export default function TemplateListView({
  sortOption,
  searchQuery = "",
}: TemplateProps) {
  const { templates, isLoading, error } = getTemplates();
  const filteredAndSortedTemplates = useMemo(() => {
    if (!templates) return [];
    
    const filtered = searchQuery
      ? templates.filter((template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : templates;

    return [...filtered].sort((a, b) => {
      if (sortOption.value === "name-ascending") {
        return a.name.localeCompare(b.name);
      } else if (sortOption.value === "name-descending") {
        return b.name.localeCompare(a.name);
      } else if (sortOption.value === "date-ascending") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else if (sortOption.value === "date-descending") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return 0;
    });
  }, [sortOption, searchQuery, templates]);

  if (isLoading) {
    return <ListLoader />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12 text-red-500 dark:text-red-400">
        <p className="text-lg font-medium">
          Failed to load templates: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredAndSortedTemplates.length > 0 ? (
        filteredAndSortedTemplates.map((template) => (
          <Link key={template.id} href={`templates/${template.id}`} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group-focus:ring-2 group-focus:ring-zinc-300 dark:group-focus:ring-zinc-700 group-focus:ring-offset-0"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative h-32 w-full md:w-48 md:h-auto bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <Image
                    src={template.image || "/placeholder-image.jpg"}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-5 w-full">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
                      {template.name}
                    </h3>
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">
                      {new Date(template.created_at).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  
                  <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {template.modules &&
                      template.modules.slice(0, 3).map((module, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="font-semibold uppercase text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                        >
                          {module.name || "Module"}
                        </Badge>
                      ))}
                    {template.modules && template.modules.length > 3 && (
                      <Badge
                        variant="outline"
                        className="font-semibold uppercase text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                      >
                        +{template.modules.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                      >
                        <span className="uppercase font-semibold text-xs">Parameters</span>
                        <span className="ml-1 h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 flex items-center justify-center">
                          {template.parameters?.length || 0}
                        </span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                      >
                        <span className="uppercase font-semibold text-xs">Modules</span>
                        <span className="ml-1 h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 flex items-center justify-center">
                          {template.modules?.length || 0}
                        </span>
                      </Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))
      ) : (
        <div className="py-16 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
          <p className="text-lg font-medium text-zinc-400 dark:text-zinc-500">
            No templates found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
