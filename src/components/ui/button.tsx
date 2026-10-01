import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary"
  size?: "sm" | "md" | "lg" | "icon"
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-primary text-on-primary hover:bg-primary/90 border-transparent",
  outline:
    "border-outline bg-background text-on-background hover:bg-secondary hover:text-on-secondary",
  ghost:
    "border-transparent text-secondary hover:bg-secondary hover:text-on-secondary",
  destructive:
    "bg-error text-on-error hover:bg-error/90 border-transparent",
  secondary:
    "bg-secondary text-on-secondary hover:bg-secondary/80 border-transparent",
}

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-7 px-3 text-[12px]",
  md: "h-9 px-4 text-[13px]",
  lg: "h-10 px-6 text-[14px]",
  icon: "h-8 w-8 p-0",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = "Button"

export { Button }
