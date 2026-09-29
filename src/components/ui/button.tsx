import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary"
  size?: "sm" | "md" | "lg" | "icon"
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-[#1E293B] text-white hover:bg-[#0F172A] border-transparent",
  outline:
    "border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-slate-50",
  ghost:
    "border-transparent text-slate-600 hover:bg-slate-100 hover:text-[#1E293B]",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 border-transparent",
  secondary:
    "bg-slate-100 text-[#1E293B] hover:bg-slate-200 border-transparent",
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]",
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
