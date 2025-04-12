"use client";

import { useState } from "react";
import { RichTextEditor } from "../utils/rich-text-editor";
import { TextFormatting } from "../utils/types";
import { Plus, Minus } from "lucide-react";
import { Button, Table, TableCell, TableRow, TableBody } from "@/components/shared";

interface CellData {
  text: string;
  formatting?: TextFormatting;
}

interface TableElementProps {
  content: {
    rows: number;
    cols: number;
    data: string[][] | CellData[][];
  };
  onChange: (content: any) => void;
  formatting?: TextFormatting;
  onFormattingChange?: (formatting: TextFormatting) => void;
  contentWidth?: number;
  isPrintPreview?: boolean;
}

export const TableElement = ({ 
  content, 
  onChange, 
  formatting = { fontSize: 14 },
  onFormattingChange,
  isPrintPreview = false
}: TableElementProps) => {
  // Use local formatting only if global formatting is not provided
  const [localFormatting, setLocalFormatting] = useState<TextFormatting>({
    fontSize: 14,
  });

  // Convert simple string data to cell data objects if needed
  const ensureCellDataFormat = () => {
    if (!content.data || content.data.length === 0) return [];
    
    // Check if we're dealing with simple string array or already have cell data objects
    const isSimpleStringArray = typeof content.data[0][0] === 'string';
    
    if (isSimpleStringArray) {
      // Convert string[][] to CellData[][]
      return (content.data as string[][]).map(row => 
        row.map(cell => ({ 
          text: cell,
          formatting: { ...formatting } // Use table default formatting initially
        }))
      );
    }
    
    // Already in correct format
    return content.data as CellData[][];
  };
  
  // Ensure we're working with the right data format
  const cellData = ensureCellDataFormat();

  // Update cell text and formatting
  const updateCell = (rowIndex: number, colIndex: number, value: string, cellFormatting?: TextFormatting) => {
    const newData = [...cellData];
    
    // Update existing cell or create new cell data object
    if (newData[rowIndex][colIndex]) {
      newData[rowIndex][colIndex] = {
        ...newData[rowIndex][colIndex],
        text: value,
        formatting: cellFormatting || newData[rowIndex][colIndex].formatting
      };
    } else {
      newData[rowIndex][colIndex] = {
        text: value,
        formatting: cellFormatting || { ...formatting }
      };
    }
    
    onChange({ ...content, data: newData });
  };

  // Update cell formatting only
  const updateCellFormatting = (rowIndex: number, colIndex: number, cellFormatting: TextFormatting) => {
    const newData = [...cellData];
    newData[rowIndex][colIndex] = {
      ...newData[rowIndex][colIndex],
      formatting: cellFormatting
    };
    onChange({ ...content, data: newData });
  };

  const addRow = () => {
    // Create a new empty row with proper CellData format
    const newRow = Array(content.cols).fill(null).map(() => ({ 
      text: "", 
      formatting: { ...formatting }
    }));
    const newData = [...cellData, newRow];
    onChange({ ...content, rows: content.rows + 1, data: newData });
  };

  const removeRow = () => {
    if (content.rows <= 1) return;
    const newData = cellData.slice(0, -1);
    onChange({ ...content, rows: content.rows - 1, data: newData });
  };

  const addColumn = () => {
    const newData = cellData.map((row) => [...row, { text: "", formatting: { ...formatting } }]);
    onChange({ ...content, cols: content.cols + 1, data: newData });
  };

  const removeColumn = () => {
    if (content.cols <= 1) return;
    const newData = cellData.map((row) => row.slice(0, -1));
    onChange({ ...content, cols: content.cols - 1, data: newData });
  };

  return (
    <div className="min-w-[400px]">
      {!isPrintPreview && (
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={removeRow}
              className="p-1 h-8 w-8 text-gray-500 hover:text-red-500"
              disabled={content.rows <= 1}
            >
              <Minus size={14} />
            </Button>
            <span className="mx-1 text-sm">Rows: {content.rows}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={addRow}
              className="p-1 h-8 w-8 text-gray-500 hover:text-blue-500"
            >
              <Plus size={14} />
            </Button>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={removeColumn}
              className="p-1 h-8 w-8 text-gray-500 hover:text-red-500"
              disabled={content.cols <= 1}
            >
              <Minus size={14} />
            </Button>
            <span className="mx-1 text-sm">Columns: {content.cols}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={addColumn}
              className="p-1 h-8 w-8 text-gray-500 hover:text-blue-500"
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
      )}
      
      <Table className="w-full border-collapse">
        <TableBody>
          {cellData.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="border-b">
              {row.map((cell, colIndex) => {
                // Get cell text and formatting
                const cellText = typeof cell === 'string' ? cell : cell.text;
                const cellFormatting = typeof cell === 'string' ? formatting : cell.formatting || formatting;
                
                return (
                  <TableCell 
                    key={colIndex} 
                    className="border p-0"
                    style={isPrintPreview ? {
                      ...cellFormatting,
                      padding: '4px 8px',
                      fontSize: `${cellFormatting.fontSize || 14}px`,
                      fontWeight: cellFormatting.bold ? 'bold' : 'normal',
                      fontStyle: cellFormatting.italic ? 'italic' : 'normal',
                      textDecoration: cellFormatting.underline ? 'underline' : 'none',
                      color: cellFormatting.color || '#000000',
                      textAlign: cellFormatting.alignment || 'left'
                    } : {}}
                  >
                    {isPrintPreview ? (
                      <div>{cellText}</div>
                    ) : (
                      <RichTextEditor
                        value={cellText}
                        onChange={(value) => updateCell(rowIndex, colIndex, value)}
                        formatting={cellFormatting}
                        onFormattingChange={(newFormatting) => updateCellFormatting(rowIndex, colIndex, newFormatting)}
                        placeholder="Cell content"
                        multiline={false}
                      />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};