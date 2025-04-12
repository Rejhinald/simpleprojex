"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import TemplateGridView from "@/components/ui/templates/template-grid-view";
import TemplateListView from "@/components/ui/templates/template-list-view";
import Link from "next/link";

export default function TemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const [activeTab, setActiveTab] = useState<string>(viewParam === "list" ? "list" : "grid");

  const [sortOption, setSortOption] = useState<SortOption>({
    value: "date-descending",
    label: "Date (Newest First)",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/templates?view=${value}`, { scroll: false });
  };

  return (
    <div className="container mx-auto px-4">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
        <div className="sticky top-0 z-10 w-full left-0 bg-background">
          <div className="container mx-auto pt-6 pb-2">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold">Templates</h1>
                <p>Manage and track your templates.</p>
              </div>
              <Link href={'/templates/create'}>
              <Button className="uppercase font-bold">
                New Template
              </Button>
              </Link>
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
            <TemplateGridView
              sortOption={sortOption}
              searchQuery={searchQuery}
            />
          </TabsContent>
          <TabsContent value="list">
            <TemplateListView
              sortOption={sortOption}
              searchQuery={searchQuery}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
