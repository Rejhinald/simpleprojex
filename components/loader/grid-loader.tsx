import React from 'react';
import { Skeleton, Card } from '@/components/shared';

interface GridLoaderProps {
  count?: number;
}

export const GridLoader: React.FC<GridLoaderProps> = ({ 
  count = 6
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="p-4 h-[200px] flex flex-col overflow-hidden">
        </Skeleton>
      ))}
    </div>
  );
};
