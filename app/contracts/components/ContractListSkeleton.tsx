"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function ContractListSkeleton() {
  // Create an array of 6 items for the skeleton grid
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {skeletonItems.map((index) => (
        <Card key={index} className="overflow-hidden border border-gray-200/80">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          
          <CardContent className="pb-0">
            <Skeleton className="h-4 w-36 mb-4" />
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center pt-4 pb-3">
            <Skeleton className="h-4 w-32" />
            
            <div className="flex gap-1">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}