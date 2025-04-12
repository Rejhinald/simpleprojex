"use client";

import { PlusCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shared";

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  onAddPage: () => void;
  onDeletePage: (pageNumber: number) => void;
}

export const PageNavigation = ({
  currentPage,
  totalPages,
  onPageChange,
  onAddPage,
  onDeletePage,
}: PageNavigationProps) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleDeletePage = () => {
    // Prevent deleting the last page
    if (totalPages > 1) {
      onDeletePage(currentPage);
      
      // If we're deleting the last page, navigate to the previous page
      if (currentPage === totalPages) {
        onPageChange(currentPage - 1);
      }
    }
  };

  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm border border-gray-200">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center px-2">
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddPage}
          aria-label="Add page"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">Add Page</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeletePage}
          disabled={totalPages <= 1}
          aria-label="Delete page"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          <span className="text-xs">Delete Page</span>
        </Button>
      </div>
    </div>
  );
};