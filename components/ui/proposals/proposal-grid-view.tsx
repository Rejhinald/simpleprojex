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
    const filtered = searchQuery
      ? proposals.filter((proposal) =>
          proposal.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="py-8 text-center col-span-3">
        <p className="text-lg font-medium">No proposals available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {filteredAndSortedProposals.length > 0 ? (
        filteredAndSortedProposals.map((proposal, index) => (
          <Card
            key={proposal.id}
            className="h-full rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="w-full h-30 relative">
              <Image
                src={proposal.image || "/placeholder-image.jpg"}
                alt={proposal.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 4}
              />
            </div>
            <CardContent>
              <h1 className="text-xl font-bold mt-2">{proposal.name}</h1>
              <p className="mt-1 text-sm text-black/50 line-clamp-3">
                {proposal.description}
              </p>

              <div className="flex justify-between items-center mt-4">
                <div className="flex flex-wrap gap-2 max-w-full">
                  {proposal.project_modules.slice(0, 4).map((category) => (
                    <Badge
                      key={category.id}
                      variant="outline"
                      className="font-bold uppercase text-xs"
                    >
                      {category.module.name}
                    </Badge>
                  ))}
                  {proposal.project_modules.length > 4 && (
                    <Badge
                      variant="outline"
                      className="font-bold uppercase text-xs"
                    >
                      +{proposal.project_modules.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <span className="uppercase font-bold">Variables</span>
                  <span className="ml-1 h-4 w-4 rounded-sm bg-black/50 text-xs text-primary-foreground flex items-center justify-center">
                    {proposal.project_parameters?.length || 0}
                  </span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <span className="uppercase font-bold">Categories</span>
                  <span className="ml-1 h-4 w-4 rounded-sm bg-black/50 text-xs text-primary-foreground flex items-center justify-center">
                    {proposal.project_modules?.length || 0}
                  </span>
                </Badge>
              </div>

              <div className="flex justify-between items-center mt-4 ml-1">
                <p className="text-sm font-bold">
                  {new Date(proposal.created_at).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <Link
                  href={`proposals/${proposal.id}`}
                  className="text-sm font-bold hover:underline"
                >
                  Read More
                </Link>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-3 py-8 text-center">
          <p className="text-lg font-medium">
            No proposals found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
