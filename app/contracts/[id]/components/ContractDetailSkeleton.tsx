"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function ContractDetailSkeleton() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div className="flex items-center gap-2">
          <Link href="/contracts">
            <Button variant="outline" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <Skeleton className="h-6 w-40 mb-3" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          
          <div>
            <Skeleton className="h-6 w-40 mb-3" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
        
        <div className="mb-8">
          <Skeleton className="h-6 w-40 mb-3" />
          <div className="overflow-x-auto">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        
        <div className="mb-8">
          <Skeleton className="h-6 w-40 mb-3" />
          <Skeleton className="h-32 w-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div>
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          <div>
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Skeleton className="h-4 w-64 mx-auto mb-1" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}