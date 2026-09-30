import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline"
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200 shadow-sm",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shadow-sm",
  warning: "bg-amber-500/10 text-amber-700 border-amber-500/20 shadow-sm",
  error: "bg-rose-500/10 text-rose-700 border-rose-500/20 shadow-sm",
  info: "bg-sky-500/10 text-sky-700 border-sky-500/20 shadow-sm",
  outline: "border-outline-variant text-on-surface bg-transparent shadow-sm",
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
