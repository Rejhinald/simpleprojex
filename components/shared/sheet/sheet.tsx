"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"

export function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}
