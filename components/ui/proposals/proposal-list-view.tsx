import React, { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/shared";
import { ProposalsGridProps } from "@/types/proposals";
import { getProposals } from "@/hooks/api/proposals/get-proposals";
import { ListLoader } from "@/components/loader/list-loader";
import Link from "next/link";

export default function ProposalListView({
  sortOption,
  searchQuery = "",
}: ProposalsGridProps) {
  const { proposals, isLoading, error } = getProposals();

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
  }, [sortOption, searchQuery, proposals]);

  if (isLoading) {
    return <ListLoader />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12 text-red-500">
        <p className="text-lg font-medium">
          Failed to load proposals: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredAndSortedProposals.length > 0 ? (
        filteredAndSortedProposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
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
            {" "}
            <Link href={`/proposals/${proposal.id}`}>
              <div className="font-bold text-xl">{proposal.name}</div>
              <div className="flex items-center justify-between mt-1 gap-x-8">
                <div className="text-sm text-black/50 line-clamp-3">
                  {proposal.description}
                </div>
                <ExternalLink className="h-8 w-8 mr-8" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex justify-between items-center mt-4">
                  <div className="flex flex-wrap gap-2 max-w-full">
                    {proposal.project_modules.slice(0, 4).map((category) => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className={`font-bold uppercase text-xs ${
                          index % 2 === 0
                            ? "border border-black/30 text-black"
                            : "bg-none text-black"
                        }`}
                      >
                        {category.module.name}
                      </Badge>
                    ))}
                    {proposal.project_modules.length > 4 && (
                      <Badge
                        variant="outline"
                        className={`font-bold uppercase text-xs ${
                          index % 2 === 0
                            ? "border border-black/30 text-black"
                            : "bg-none text-black"
                        }`}
                      >
                        +{proposal.project_modules.length - 4} more
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
                        {proposal.project_parameters?.length || 0}
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
                        {proposal.project_parameters?.length || 0}
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
            No proposals found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
