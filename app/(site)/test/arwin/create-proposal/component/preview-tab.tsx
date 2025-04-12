"use client"

import { 
  ScrollArea, Badge, Alert, AlertDescription, Card, CardHeader, 
  CardTitle, CardContent
} from "@/components/shared"
import { Calculator } from "lucide-react"
import { CostPreview } from "./types"

interface PreviewTabProps {
  selectedTemplateData: any | null;
  costPreviews: CostPreview[];
  useGlobalMarkup: boolean;
  globalMarkup: number;
  totalCosts: {
    materialCost: number;
    laborCost: number;
    markupAmount: number;
    totalCost: number;
  };
}

export function PreviewTab({
  selectedTemplateData,
  costPreviews,
  useGlobalMarkup,
  globalMarkup,
  totalCosts
}: PreviewTabProps) {
  if (!selectedTemplateData) {
    return (
      <div className="text-center py-8 bg-secondary/50 rounded-md">
        Select a template to view cost preview
      </div>
    );
  }

  if (costPreviews.length === 0) {
    return (
      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200 rounded-md">
        <AlertDescription>
          Enter values for your variables in the Variables tab to see cost previews.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Cost Preview
        </h4>
        <Badge variant="outline" className="text-sm rounded-md">
          {useGlobalMarkup ? `Using ${globalMarkup}% Global Markup` : "Using Individual Markups"}
        </Badge>
      </div>
      
      <ScrollArea className="h-[350px] border rounded-md shadow-sm">
        <div className="p-4 space-y-6">
          {selectedTemplateData.categories.map((category: any) => {
            const categoryPreviews = costPreviews.filter(p => p.categoryName === category.name);
            
            if (categoryPreviews.length === 0) return null;
            
            return (
              <div key={category.id} className="space-y-4">
                <h5 className="text-sm uppercase tracking-wider">{category.name}</h5>
                <div className="space-y-3">
                  {categoryPreviews.map((preview) => (
                    <Card key={preview.elementId} className="overflow-hidden rounded-md shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h6>{preview.elementName}</h6>
                          <Badge className="bg-primary text-primary-foreground rounded-md">
                            ${preview.totalCost.toFixed(2)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span>Material:</span> ${preview.materialCost.toFixed(2)}
                          </div>
                          <div>
                            <span>Labor:</span> ${preview.laborCost.toFixed(2)}
                            <span className="text-xs"> (@${preview.laborRate}/hr)</span>
                          </div>
                          <div>
                            <span>Markup:</span> ${preview.markupAmount.toFixed(2)}
                            <span className="text-xs"> ({preview.markupPercentage}%)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      {/* Summary Card */}
      <Card className="overflow-hidden rounded-md shadow-sm bg-secondary/10">
        <CardHeader className="p-4 bg-secondary/30 border-b">
          <CardTitle className="text-base">Proposal Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-background rounded-md">
              <p className="text-sm">Material</p>
              <p className="text-xl">${totalCosts.materialCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-background rounded-md">
              <p className="text-sm">Labor</p>
              <p className="text-xl">${totalCosts.laborCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-background rounded-md">
              <p className="text-sm">Markup</p>
              <p className="text-xl">${totalCosts.markupAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-md">
              <p className="text-sm text-primary">Total</p>
              <p className="text-xl font-bold text-primary">${totalCosts.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}