'use client'

import React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import {Label} from "@/components/shared"
import { cn } from "@/lib/utils"
import { useFormField } from "@/hooks/use-form-field"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"
export { FormLabel }