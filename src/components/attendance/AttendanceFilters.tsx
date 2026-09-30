"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

interface Props {
  employees: { id: string; name: string; code: string }[]
  isAdminLike: boolean
  currentDate: string
  currentEmployeeId?: string
}

export function AttendanceFilters({ employees, isAdminLike, currentDate, currentEmployeeId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams.toString())
      if (value) p.set(key, value)
      else p.delete(key)
      router.push(`?${p.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-44">
        <label className="mb-1 block text-[12px] font-medium text-muted-foreground">Date</label>
        <Input
          type="date"
          defaultValue={currentDate}
          onChange={(e) => update("date", e.target.value)}
        />
      </div>
      {isAdminLike && (
        <div className="w-56">
          <label className="mb-1 block text-[12px] font-medium text-muted-foreground">Employee</label>
          <Select
            defaultValue={currentEmployeeId ?? ""}
            onChange={(e) => update("employeeId", e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
            ))}
          </Select>
        </div>
      )}
    </div>
  )
}
