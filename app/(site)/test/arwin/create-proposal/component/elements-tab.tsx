"use client"

import { 
  ScrollArea, Card, CardHeader, CardTitle, CardContent, 
  Slider, Input, Tooltip, TooltipTrigger, TooltipContent 
} from "@/components/shared"
import { cn } from "@/lib/utils"

interface ElementsTabProps {
  selectedTemplateData: any | null;
  useGlobalMarkup: boolean;
  globalMarkup: number;
  elementMarkups: Record<number, number>;
  laborRates: Record<number, string>;
  onElementMarkupChange: (elementId: number, value: number) => void;
  onLaborRateChange: (elementId: number, value: string) => void;
}

export function ElementsTab({
  selectedTemplateData,
  useGlobalMarkup,
  globalMarkup,
  elementMarkups,
  laborRates,
  onElementMarkupChange,
  onLaborRateChange
}: ElementsTabProps) {
  if (!selectedTemplateData) {
    return (
      <div className="text-center py-8 bg-secondary/50 rounded-md">
        Select a template to view elements
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          Elements from the selected template with individual markup settings.
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-8 pr-4">
          {selectedTemplateData.categories.map((category: any) => (
            <div key={category.id} className="space-y-3">
              <h4 className="text-sm uppercase tracking-wider">
                {category.name}
              </h4>
              <div className="space-y-4">
                {category.elements.map((element: any) => (
                  <Card
                    key={element.id}
                    className="overflow-hidden border rounded-md shadow-sm"
                  >
                    <CardHeader className="p-4 bg-secondary/30 border-b">
                      <CardTitle className="text-base">{element.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span>Material Cost:</span> {element.material_cost}
                        </div>
                        <div>
                          <span>Labor Cost:</span> {element.labor_cost}
                        </div>
                      </div>
                      
                      {/* Labor Rate Input */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm">
                            Labor Rate
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="ml-1 text-xs rounded-full border px-1.5 inline-block leading-none">?</span>
                              </TooltipTrigger>
                              <TooltipContent className="p-2 text-xs rounded-md">
                                Rate per hour for labor calculations
                              </TooltipContent>
                            </Tooltip>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">$</span>
                          <Input
                            type="number"
                            value={laborRates[element.id] || "0"}
                            onChange={(e) => onLaborRateChange(element.id, e.target.value)}
                            className="w-24 rounded-md"
                          />
                          <span className="ml-2">per hour</span>
                        </div>
                      </div>
                      
                      {/* Element Markup Slider - only enabled if global markup is disabled */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Markup:</span>
                          <span className="text-sm">
                            {elementMarkups[element.id] || globalMarkup}%
                          </span>
                        </div>
                        <Slider
                          disabled={useGlobalMarkup}
                          defaultValue={[globalMarkup]}
                          max={50}
                          step={1}
                          value={[elementMarkups[element.id] || globalMarkup]}
                          onValueChange={(value) => onElementMarkupChange(element.id, value[0])}
                          className={cn(
                            "w-full",
                            useGlobalMarkup && "opacity-50"
                          )}
                        />
                        {useGlobalMarkup && (
                          <p className="text-xs">
                            Using global markup. Disable global markup to set individual markup.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}