"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function AttendanceDateFilter({ currentDate }: { currentDate: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set("date", value)
    else p.delete("date")
    router.push(`?${p.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-secondary dark:text-slate-300 w-full sm:w-auto focus-within:border-primary/50 transition-colors">
      <input 
        type="date" 
        value={currentDate} 
        onChange={handleDateChange}
        className="bg-transparent border-none outline-none text-on-surface dark:text-white cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
      />
    </div>
  )
}
