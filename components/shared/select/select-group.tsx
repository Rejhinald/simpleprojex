"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"

export function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}
