import React, { useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, Badge } from "@/components/shared";
import Link from "next/link";
import { ProposalsGridProps } from "@/types/proposals";
import { getProposals } from "@/hooks/api/proposals/get-proposals";
import { GridLoader } from "@/components/loader/grid-loader";

export default function ProposalGridView({
  sortOption,
  searchQuery = "",
}: ProposalsGridProps) {
  const { proposals, isLoading, error, refetch } = getProposals();

  const filteredAndSortedProposals = useMemo(() => {
    if (!Array.isArray(proposals)) return [];
    
    const filtered = searchQuery
      ? proposals.filter((proposal) =>
          proposal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (proposal.description && proposal.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : proposals;

    return [...filtered].sort((a, b) => {
      if (sortOption.value === "name-ascending") {
        return a.name.localeCompare(b.name);
      } else if (sortOption.value === "name-descending") {
        return b.name.localeCompare(a.name);
      } else if (sortOption.value === "date-ascending") {
        try {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          if (isNaN(dateA) || isNaN(dateB)) {
            console.error("Invalid date format found in proposals");
            return 0;
          }

          return dateA - dateB;
        } catch (error) {
          console.error("Error sorting by date:", error);
          return 0;
        }
      } else if (sortOption.value === "date-descending") {
        try {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();

          if (isNaN(dateA) || isNaN(dateB)) {
            console.error("Invalid date format found in proposals");
            return 0;
          }

          return dateB - dateA;
        } catch (error) {
          console.error("Error sorting by date:", error);
          return 0;
        }
      }
      return 0;
    });
  }, [proposals, sortOption, searchQuery]);

  if (isLoading) {
    return <GridLoader />;
  }

  if (!Array.isArray(proposals) || proposals.length === 0) {
    return (
      <div className="col-span-3 py-8 text-center">
        <p className="text-lg font-medium text-zinc-400">No proposals available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedProposals.length > 0 ? (
        filteredAndSortedProposals.map((proposal) => (
          <Link
            key={proposal.id}
            href={`proposals/${proposal.id}`}
            className="group"
          >
            <Card
              className="h-full rounded-2xl overflow-hidden transition-all duration-200 shadow-none group-hover:shadow-xl group-hover:-translate-y-1 border border-zinc-200 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm cursor-pointer"
            >
              <div className="w-full h-40 relative bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={proposal.image || "/placeholder-image.jpg"}
                  alt={proposal.name}
                  fill
                  className="object-cover"
                  style={{ borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
                />
              </div>
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-100 truncate">
                  {proposal.name}
                </h2>
                <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 min-h-[48px]">
                  {proposal.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {proposal.project_modules?.slice(0, 4).map((category) => (
                    <Badge
                      key={category.id}
                      variant="outline"
                      className="font-semibold uppercase text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                    >
                      {category.module?.name || "Module"}
                    </Badge>
                  ))}
                  {proposal.project_modules?.length > 4 && (
                    <Badge
                      variant="outline"
                      className="font-semibold uppercase text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                    >
                      +{proposal.project_modules.length - 4} more
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
                      {proposal.project_parameters?.length || 0}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-2 py-0.5"
                  >
                    <span className="uppercase font-semibold">Modules</span>
                    <span className="ml-1 h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 flex items-center justify-center px-1">
                      {proposal.project_modules?.length || 0}
                    </span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs font-medium text-zinc-400">
                    {new Date(proposal.created_at).toLocaleDateString("en-US", {
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
            No proposals found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
