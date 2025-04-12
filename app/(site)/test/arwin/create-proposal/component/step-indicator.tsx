"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full py-4">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className="flex items-center"
        >
          {/* Circle indicator */}
          <button
            type="button"
            onClick={() => onStepClick?.(index)}
            disabled={index > currentStep}
            className={cn(
              "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
              index < currentStep
                ? "bg-primary/90 border-primary text-primary-foreground"
                : index === currentStep
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-background border-muted-foreground/20 text-muted-foreground",
              onStepClick && index <= currentStep ? "cursor-pointer hover:opacity-90" : "cursor-default"
            )}
            aria-current={index === currentStep ? "step" : undefined}
          >
            {index < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
            
            {/* Step label */}
            <span className={cn(
              "absolute top-full mt-1 text-xs whitespace-nowrap",
              index === currentStep ? "font-medium text-primary" : "text-muted-foreground"
            )}>
              {step}
            </span>
          </button>
          
          {/* Connector line between steps */}
          {index < steps.length - 1 && (
            <div className={cn(
              "h-[2px] w-12 mx-1",
              index < currentStep
                ? "bg-primary"
                : "bg-muted-foreground/20"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}