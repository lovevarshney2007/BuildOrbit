import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline"
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-surface-container-high text-on-surface dark:text-white border-outline-variant dark:border-slate-800 shadow-sm",
  success: "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 shadow-sm",
  warning: "bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-800 shadow-sm",
  error: "bg-slate-300 text-slate-900 dark:text-white border-slate-400 shadow-sm",
  info: "bg-surface-container dark:bg-slate-950 text-on-surface dark:text-white border-outline-variant dark:border-slate-800 shadow-sm",
  outline: "border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 bg-transparent shadow-sm",
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
