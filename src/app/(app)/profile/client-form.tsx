"use client"

import { useActionState } from "react"
import { updateProfileAction, type ProfileState } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ClientFormProps {
  initialData: {
    phone?: string
    address?: string
    dateOfBirth?: string
  }
}

export function ProfileForm({ initialData }: ClientFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    null
  )

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      {state?.message && (
        <div className={`rounded-md p-3 text-[13px] font-medium ${state.success ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 border border-slate-300' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {state.message}
        </div>
      )}

      <div className="grid gap-2">
        <label htmlFor="phone" className="text-[13px] font-medium text-on-surface dark:text-white">
          Phone Number
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialData.phone || ""}
          placeholder="+1 (555) 000-0000"
        />
        {state?.errors?.phone && (
          <p className="text-[12px] text-red-500">{state.errors.phone[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="address" className="text-[13px] font-medium text-on-surface dark:text-white">
          Address
        </label>
        <Input
          id="address"
          name="address"
          defaultValue={initialData.address || ""}
          placeholder="123 Main St, City, Country"
        />
        {state?.errors?.address && (
          <p className="text-[12px] text-red-500">{state.errors.address[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="dateOfBirth" className="text-[13px] font-medium text-on-surface dark:text-white">
          Date of Birth
        </label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          defaultValue={initialData.dateOfBirth || ""}
        />
        {state?.errors?.dateOfBirth && (
          <p className="text-[12px] text-red-500">{state.errors.dateOfBirth[0]}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
