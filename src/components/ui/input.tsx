import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-[13px] text-[#1E293B]",
          "placeholder:text-[#94A3B8]",
          "focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
