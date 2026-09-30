import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline"
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-surface-container-high text-on-surface border-outline-variant shadow-sm",
  success: "bg-slate-200 text-slate-800 border-slate-300 shadow-sm",
  warning: "bg-slate-100 text-slate-600 border-slate-200 shadow-sm",
  error: "bg-slate-300 text-slate-900 border-slate-400 shadow-sm",
  info: "bg-surface-container text-on-surface border-outline-variant shadow-sm",
  outline: "border-outline-variant text-secondary bg-transparent shadow-sm",
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase transition-colors",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
