"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "@/components/shared"
import { VariableValue } from "./types"

interface VariableTypeTabsProps {
  variableTypes: string[];
  children: (selectedType: string | null) => React.ReactNode;
  typeCounts: Record<string, number>;
}

export function VariableTypeTabs({ variableTypes, children, typeCounts }: VariableTypeTabsProps) {
  const [selectedType, setSelectedType] = useState<string | null>("all");
  
  return (
    <Tabs defaultValue="all" onValueChange={(value) => setSelectedType(value === "all" ? null : value)}>
      <TabsList className="mb-4">
        <TabsTrigger value="all" className="rounded-md">
          All Variables <Badge variant="secondary" className="ml-2">{Object.values(typeCounts).reduce((a, b) => a + b, 0)}</Badge>
        </TabsTrigger>
        {variableTypes.map(type => (
          <TabsTrigger key={type} value={type} className="rounded-md">
            {type} <Badge variant="secondary" className="ml-2">{typeCounts[type] || 0}</Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        {children(null)}
      </TabsContent>
      
      {variableTypes.map(type => (
        <TabsContent key={type} value={type} className="space-y-4">
          {children(type)}
        </TabsContent>
      ))}
    </Tabs>
  );
}