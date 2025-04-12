"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"

export function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}
