import { useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, Badge } from "@/components/shared";
import Link from "next/link";
import { TemplateProps } from "@/types/templates";
import { getTemplates } from "@/hooks/api/templates/get-templates";
import { GridLoader } from "@/components/loader/grid-loader";

export default function TemplateGridView({
  sortOption,
  searchQuery = "",
}: TemplateProps) {
  const { templates, isLoading, error } = getTemplates();

  const filteredAndSortedTemplates = useMemo(() => {
    if (!templates) return [];

    const filtered = searchQuery
      ? templates.filter(
          (template) =>
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
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
    return <GridLoader />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedTemplates.length > 0 ? (
        filteredAndSortedTemplates.map((template) => (
          <Link
            key={template.id}
            href={`templates/${template.id}`}
            className="group"
          >
            <Card
              className="h-full rounded-2xl overflow-hidden transition-all duration-200 shadow-none group-hover:shadow-xl group-hover:-translate-y-1 border border-zinc-200 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm cursor-pointer"
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
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      ) : (
        <div className="col-span-3 py-8 text-center">
          <p className="text-lg font-medium text-zinc-400">
            No templates found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}


