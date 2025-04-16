"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TemplateTour } from "@/components/features/joyride/template-tour";
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
import { Info } from "lucide-react";

export default function TemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const [activeTab, setActiveTab] = useState<string>(
    viewParam === "list" ? "list" : "grid"
  );

  const [sortOption, setSortOption] = useState<SortOption>({
    value: "date-descending",
    label: "Date (Newest First)",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [runTour, setRunTour] = useState(false);
  const [tourId, setTourId] = useState(0); // To force TemplateTour to re-render properly

  // Check if user has seen the tour before - run on initial mount only
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTemplatesTour");
    if (!hasSeenTour) {
      // Delay the start of the tour slightly to ensure all components are rendered
      const timeout = setTimeout(() => {
        setRunTour(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, []);

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

  const startTour = () => {
    // Reset tour and increment tourId to force re-render
    setRunTour(false);

    // Brief timeout to ensure state update before starting again
    setTimeout(() => {
      setTourId((prev) => prev + 1);
      setRunTour(true);
    }, 50);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto px-2 md:px-6 pb-10">
        <TemplateTour
          key={tourId}
          isRunning={runTour}
          setIsRunning={setRunTour}
        />

        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <div className="sticky top-0 z-10 w-full left-0 bg-background/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
            <div className="container mx-auto pt-8 pb-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div className="flex flex-col gap-1">
                  <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Templates
                  </h1>
                  <p className="text-base text-zinc-500 dark:text-zinc-400">
                    Manage and track your templates.
                  </p>
                </div>
                <Link href={"/templates/create"} className="shrink-0">
                  <Button
                    id="new-template"
                    className="uppercase font-semibold tracking-wide rounded-xl px-7 py-5 h-11 text-sm bg-zinc-900 text-white 
                    shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.06),0_4px_16px_-2px_rgba(0,0,0,0.1),0_0_0_0_rgba(255,255,255,0)_inset] 
                    dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.2),0_4px_16px_-2px_rgba(0,0,0,0.3),0_0_0_0_rgba(255,255,255,0.1)_inset]
                    transition-all duration-300 ease-out
                    hover:bg-zinc-800 hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.1),0_4px_24px_-4px_rgba(0,0,0,0.15),0_0_0_0_rgba(255,255,255,0.2)_inset] 
                    dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3),0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_0_0_rgba(255,255,255,0.2)_inset]
                    active:scale-[0.98] active:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.1),0_0_0_0_rgba(255,255,255,0.1)_inset]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      New Template
                    </span>
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <SearchComponent
                    onChange={handleSearchChange}
                    value={searchQuery}
                    className="rounded-lg px-4 py-2.5 h-11 text-sm border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-700 focus-within:ring-offset-0"
                  />
                  <SortByComponent
                    onChange={handleSortChange}
                    initialValue={sortOption.value}
                    className="rounded-lg px-4 py-2.5 h-11 text-sm border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-700 focus-within:ring-offset-0"
                  />
                </div>
                <TabsList className="rounded-lg bg-zinc-100 dark:bg-zinc-800/70 p-1 flex gap-0.5 h-10">
                  <TabsTrigger
                    value="grid"
                    className="rounded-md px-4 py-2 text-sm font-medium
                      data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm 
                      data-[state=inactive]:text-zinc-500 data-[state=inactive]:hover:text-zinc-700
                      dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-zinc-100 
                      dark:data-[state=inactive]:text-zinc-400 dark:data-[state=inactive]:hover:text-zinc-300
                      transition-all duration-150"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-grid"
                      >
                        <rect width="7" height="7" x="3" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="14" rx="1" />
                        <rect width="7" height="7" x="3" y="14" rx="1" />
                      </svg>
                      Grid
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="rounded-md px-4 py-2 text-sm font-medium
                      data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm 
                      data-[state=inactive]:text-zinc-500 data-[state=inactive]:hover:text-zinc-700
                      dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-zinc-100 
                      dark:data-[state=inactive]:text-zinc-400 dark:data-[state=inactive]:hover:text-zinc-300
                      transition-all duration-150"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-list"
                      >
                        <line x1="8" x2="21" y1="6" y2="6" />
                        <line x1="8" x2="21" y1="12" y2="12" />
                        <line x1="8" x2="21" y1="18" y2="18" />
                        <line x1="3" x2="3.01" y1="6" y2="6" />
                        <line x1="3" x2="3.01" y1="12" y2="12" />
                        <line x1="3" x2="3.01" y1="18" y2="18" />
                      </svg>
                      List
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
          <div className="container mx-auto mt-2" id="content">
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

        <Button
          onClick={startTour}
          variant="outline"
          size="sm"
          className="fixed bottom-6 right-6 h-10 px-4 text-sm font-medium rounded-md border border-zinc-200
          dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-md"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            Tour Guide
          </span>
        </Button>
      </div>
    </Suspense>
  );
}
