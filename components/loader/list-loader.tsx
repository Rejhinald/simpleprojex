import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton, Badge } from '@/components/shared';

interface ListLoaderProps {
  count?: number;
}

export const ListLoader: React.FC<ListLoaderProps> = ({ 
  count = 5
}) => {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 28,
            duration: 0.3
          }}
          className={`border rounded-md p-4 ${
            index % 2 === 0 ? "bg-[#e8e8e8]" : "bg-white"
          }`}
        >
          {/* Title skeleton */}
          <Skeleton className="h-7 w-1/3 rounded-md mb-2" />
          
          {/* Description skeleton and icon area */}
          <div className="flex items-center justify-between mt-1 gap-x-8">
            <div className="flex flex-col gap-1 flex-grow">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md mr-8" />
          </div>
          
          {/* Badges skeleton */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex flex-wrap gap-2 max-w-full">
              {Array.from({ length: 4 }).map((_, badgeIndex) => (
                <Skeleton 
                  key={badgeIndex} 
                  className="h-6 w-20 rounded-full" 
                />
              ))}
              
              {/* Variable and Categories badges skeletons */}
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
