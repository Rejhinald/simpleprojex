"use client"

import { ScrollArea, Card, CardContent, Checkbox } from "@/components/shared"

interface CategoriesTabProps {
  selectedTemplateData: any | null;
  editingEnabled: boolean;
  onEditingEnabledChange: (enabled: boolean) => void;
}

export function CategoriesTab({ 
  selectedTemplateData, 
  editingEnabled,
  onEditingEnabledChange
}: CategoriesTabProps) {
  if (!selectedTemplateData) {
    return (
      <div className="text-center py-8 bg-secondary/50 rounded-md">
        Select a template to view categories
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          Categories from the selected template. Enable editing to make changes.
        </p>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-editing"
            checked={editingEnabled}
            onCheckedChange={(checked) => onEditingEnabledChange(checked === true)}
            className="rounded-sm"
          />
          <label htmlFor="enable-editing" className="text-sm">
            Enable editing
          </label>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4 pr-4">
          {selectedTemplateData.categories.map((category: any) => (
            <Card key={category.id} className="overflow-hidden border rounded-md shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    disabled={!editingEnabled}
                    defaultChecked
                    className="rounded-sm"
                  />
                  <label htmlFor={`category-${category.id}`} className="text-sm">
                    {category.name}
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}