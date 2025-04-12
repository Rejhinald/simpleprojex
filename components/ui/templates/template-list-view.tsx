import React, { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/shared";
import { getTemplates } from "@/hooks/api/templates/get-templates";
import { TemplateProps } from "@/types/templates";
import { ListLoader } from "@/components/loader/list-loader";
import Link from "next/link";

export default function TemplateListView({
  sortOption,
  searchQuery = "",
}: TemplateProps) {
  const { templates, isLoading, error } = getTemplates();
  const filteredAndSortedTemplates = useMemo(() => {
    const filtered = searchQuery
      ? templates.filter((template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex justify-center items-center py-12 text-red-500">
        <p className="text-lg font-medium">
          Failed to load templates: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredAndSortedTemplates.length > 0 ? (
        filteredAndSortedTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              duration: 0.3,
            }}
            whileHover={{
              scale: 1.01,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
              cursor: "pointer",
            }}
            className={`border rounded-md p-4 ${
              index % 2 === 0 ? "bg-[#e8e8e8]" : "bg-white"
            }`}
          >
            <Link href={`/proposals/${template.id}`}>
              <div className="font-bold text-xl">{template.name}</div>
              <div className="flex items-center justify-between mt-1 gap-x-8">
                <div className="text-sm text-black/50 line-clamp-3">
                  {template.description}
                </div>
                <ExternalLink className="h-8 w-8 mr-8" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex justify-between items-center mt-4">
                  <div className="flex flex-wrap gap-2 max-w-full">
                    {template.modules.slice(0, 4).map((category) => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className={`font-bold uppercase text-xs ${
                          index % 2 === 0
                            ? "border border-black/30 text-black"
                            : "bg-none text-black"
                        }`}
                      >
                        {category.name}
                      </Badge>
                    ))}
                    {template.modules.length > 4 && (
                      <Badge
                        variant="outline"
                        className={`font-bold uppercase text-xs ${
                          index % 2 === 0
                            ? "border border-black/30 text-black"
                            : "bg-none text-black"
                        }`}
                      >
                        +{template.modules.length - 4} more
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 ${
                        index % 2 === 0
                          ? "border border-black/30 text-black"
                          : "bg-none text-black"
                      }`}
                    >
                      <span className="uppercase font-bold">Variables</span>
                      <span
                        className={`ml-1 h-4 w-4 rounded-sm text-xs flex items-center justify-center bg-black/50 text-primary-foreground`}
                      >
                        {template.parameters?.length || 0}
                      </span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 ${
                        index % 2 === 0
                          ? "border border-black/30 text-black"
                          : "bg-none text-black"
                      }`}
                    >
                      <span className="uppercase font-bold">Categories</span>
                      <span
                        className={`ml-1 h-4 w-4 rounded-sm text-xs flex items-center justify-center bg-black/50 text-primary-foreground`}
                      >
                        {template.parameters?.length || 0}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))
      ) : (
        <div className="col-span-3 py-8 text-center">
          <p className="text-lg font-medium">
            No templates found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
