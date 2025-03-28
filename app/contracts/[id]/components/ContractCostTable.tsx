"use client";

import { ElementValue } from "../../../api/apiService";
import { useMemo } from "react";

interface ContractCostTableProps {
  elementValues: ElementValue[];
}

export function ContractCostTable({ elementValues }: ContractCostTableProps) {
  // Organize elements by category
  const elementsByCategory = useMemo(() => {
    return elementValues.reduce((acc, element) => {
      const categoryName = element.category_name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(element);
      return acc;
    }, {} as Record<string, ElementValue[]>);
  }, [elementValues]);
  
  // Calculate totals
  const totals = useMemo(() => {
    let totalMaterial = 0;
    let totalLabor = 0;
    let totalWithMarkup = 0;
    
    elementValues.forEach(element => {
      totalMaterial += parseFloat(element.calculated_material_cost) || 0;
      totalLabor += parseFloat(element.calculated_labor_cost) || 0;
      totalWithMarkup += element.total_with_markup || 0;
    });
    
    return { totalMaterial, totalLabor, totalWithMarkup };
  }, [elementValues]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <div>
      <h3 className="font-semibold text-lg border-b pb-1 mb-4">Project Scope and Pricing</h3>
      
      {Object.entries(elementsByCategory).map(([categoryName, elements]) => (
        <div key={categoryName} className="mb-6">
          <h4 className="font-medium text-md mb-2">{categoryName}</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium">Item</th>
                  <th className="text-right px-4 py-2 text-sm font-medium">Material</th>
                  <th className="text-right px-4 py-2 text-sm font-medium">Labor</th>
                  <th className="text-right px-4 py-2 text-sm font-medium">Markup</th>
                  <th className="text-right px-4 py-2 text-sm font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {elements.map((element) => (
                  <tr key={element.element_id} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-medium">{element.element_name}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(parseFloat(element.calculated_material_cost) || 0)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(parseFloat(element.calculated_labor_cost) || 0)}</td>
                    <td className="px-4 py-2 text-right">{element.markup_percentage}%</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(element.total_with_markup || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      
      <div className="border-t pt-4">
        <div className="flex justify-end">
          <table className="text-right">
            <tbody>
              <tr>
                <td className="px-4 py-1 font-medium">Material Subtotal:</td>
                <td className="px-4 py-1">{formatCurrency(totals.totalMaterial)}</td>
              </tr>
              <tr>
                <td className="px-4 py-1 font-medium">Labor Subtotal:</td>
                <td className="px-4 py-1">{formatCurrency(totals.totalLabor)}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-bold">TOTAL WITH MARKUP:</td>
                <td className="px-4 py-2 font-bold text-green-700">{formatCurrency(totals.totalWithMarkup)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}