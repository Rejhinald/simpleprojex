"use client";

import { useRef } from "react";
import { useDrag } from "react-dnd";
import { 
  Type, 
  TextQuote, 
  ListOrdered, 
  List, 
  Table2, 
  PenTool,
  Columns
} from "lucide-react";

export const ElementToolbar = () => {
  return (
    <div className="w-full bg-white">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4 items-center">
            <h3 className="text-sm font-medium text-gray-500">Basic Elements</h3>
            <div className="flex space-x-2">
              <DraggableElement 
                type="header" 
                icon={<Type />} 
                label="Header" 
              />
              <DraggableElement 
                type="text" 
                icon={<TextQuote />} 
                label="Text" 
              />
              <DraggableElement 
                type="bulletList" 
                icon={<List />} 
                label="Bullet List" 
              />
              <DraggableElement 
                type="numberList" 
                icon={<ListOrdered />} 
                label="Number List" 
              />
              <DraggableElement 
                type="table" 
                icon={<Table2 />} 
                label="Table" 
              />
              {/* Remove the ElementToolbarButton for columns - it's duplicating functionality */}
            </div>
          </div>
          
          <div className="flex space-x-4 items-center">
            <h3 className="text-sm font-medium text-gray-500">Floating Elements</h3>
            <div className="flex space-x-2">
              <DraggableElement 
                type="signature" 
                icon={<PenTool />} 
                label="Signature" 
                isFloating={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DraggableElementProps {
  type: string;
  icon: React.ReactNode;
  label: string;
  isFloating?: boolean;
}

const DraggableElement = ({ type, icon, label, isFloating }: DraggableElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: isFloating ? "FLOATING_ELEMENT" : "ELEMENT",
    item: { 
      type, 
      isFloating,
      isMoving: false, // Flag to indicate this is a new element, not a move
      preview: { icon, label } // Include preview information for the drop indicator
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Connect the drag ref to our element ref
  dragRef(elementRef);

  return (
    <div
      ref={elementRef}
      className={`flex items-center px-3 py-2 rounded border cursor-move 
        hover:bg-gray-100 transition-colors
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isFloating ? "border-blue-300 bg-blue-50 hover:bg-blue-100" : "border-gray-200 bg-gray-50"}`}
    >
      <div className="text-gray-600 mr-2">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
  );
};

interface ElementToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const ElementToolbarButton = ({ icon, label, onDragStart }: ElementToolbarButtonProps) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center px-3 py-2 rounded border cursor-move 
        hover:bg-gray-100 transition-colors border-gray-200 bg-gray-50"
    >
      <div className="text-gray-600 mr-2">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
  );
};