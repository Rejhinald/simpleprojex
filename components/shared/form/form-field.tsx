"use client"

import * as React from "react"
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form"

import { FormFieldContext } from "@/components/contexts/form-contexts"

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}
