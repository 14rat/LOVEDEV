"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

// Optimize useFormField hook to memoize expensive calculations
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  // Memoize field state to avoid unnecessary calculations
  const fieldState = React.useMemo(
    () => getFieldState(fieldContext.name, formState),
    [getFieldState, fieldContext.name, formState]
  );

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  // Memoize the returned object to prevent unnecessary re-renders
  return React.useMemo(() => ({
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }), [id, fieldContext.name, fieldState]);
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

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

const FormControl = React.memo(React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  // Memoize aria-describedby to prevent unnecessary re-calculations
  const ariaDescribedBy = React.useMemo(
    () => !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
    [error, formDescriptionId, formMessageId]
  );

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={!!error}
      {...props}
    />
  )
}));
FormControl.displayName = "FormControl"

const FormDescription = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  // Memoize className to prevent unnecessary recalculations
  const computedClassName = React.useMemo(
    () => cn("text-sm text-muted-foreground", className),
    [className]
  );

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={computedClassName}
      {...props}
    />
  )
}));
FormDescription.displayName = "FormDescription"

const FormMessage = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  
  // Memoize the body content to prevent unnecessary string operations
  const body = React.useMemo(
    () => error ? String(error?.message ?? "") : children,
    [error, children]
  );

  // Memoize className calculation
  const computedClassName = React.useMemo(
    () => cn("text-sm font-medium text-destructive", className),
    [className]
  );

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={computedClassName}
      {...props}
    >
      {body}
    </p>
  )
}));
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
