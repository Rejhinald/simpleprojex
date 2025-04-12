"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Separator,
} from "@/components/shared";
import { SortByComponent } from "@/components/shared/ui/sort-by-component";
import { SearchComponent } from "@/components/shared/ui/search-component";
import { SortOption } from "@/types/sort";
import ProposalGridView from "@/components/ui/proposals/proposal-grid-view";
import ProposalListView from "@/components/ui/proposals/proposal-list-view";
import CreateProposalModal from "../create-proposal/create-proposal-modal";

export default function ProposalPage() {
  const [sortOption, setSortOption] = useState<SortOption>({
    value: "date-descending",
    label: "Date (Newest First)",
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };

  return (
    <div>
      <Tabs defaultValue="grid">
        <div className="sticky top-0 z-10 w-full left-0 bg-background">
          <div className="container mx-auto pt-6 pb-2">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold">Proposals</h1>
                <p>Manage and track client proposals.</p>
              </div>
              <Button 
                className="uppercase font-bold" 
                onClick={() => setIsModalOpen(true)}
              >
                New Proposal
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 flex-wrap">
                <SearchComponent
                  onChange={handleSearchChange}
                  value={searchQuery}
                />
                <SortByComponent
                  onChange={handleSortChange}
                  initialValue={sortOption.value}
                />
              </div>
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </div>
            <Separator className="mt-4" />
          </div>
        </div>
        <div className="container mx-auto">
          <TabsContent value="grid">
            <ProposalGridView
              sortOption={sortOption}
              searchQuery={searchQuery}
            />
          </TabsContent>
          <TabsContent value="list">
            <ProposalListView
              sortOption={sortOption}
              searchQuery={searchQuery}
            />
          </TabsContent>
        </div>
      </Tabs>
      
      <CreateProposalModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}