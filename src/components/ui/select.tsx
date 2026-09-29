import * as React from "react"
import { cn } from "@/lib/utils"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-[13px] text-[#1E293B]",
          "focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "appearance-none cursor-pointer",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  },
)
Select.displayName = "Select"

export { Select }
