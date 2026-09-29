import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) redirect("/dashboard")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage system-wide configuration."
      />

      <div className="max-w-2xl rounded-lg border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-[14px] font-semibold text-[#1E293B]">Organization Profile</h2>
        <p className="mb-4 text-[13px] text-[#64748B]">
          Update your company details and working preferences.
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#1E293B]">Company Name</label>
            <input
              type="text"
              defaultValue="BuildOrbit Inc."
              className="h-9 w-full rounded-md border border-[#E2E8F0] px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#1E293B]">Timezone</label>
              <select
                className="h-9 w-full rounded-md border border-[#E2E8F0] px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              >
                <option>UTC (Coordinated Universal Time)</option>
                <option>Asia/Kolkata (IST)</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#1E293B]">Work Week Starts</label>
              <select
                className="h-9 w-full rounded-md border border-[#E2E8F0] px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              >
                <option>Monday</option>
                <option>Sunday</option>
              </select>
            </div>
          </div>

          <hr className="my-2 border-[#E2E8F0]" />

          <h2 className="text-[14px] font-semibold text-[#1E293B]">System Preferences</h2>
          <p className="mb-2 text-[13px] text-[#64748B]">
            Configure default behaviors for the application.
          </p>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-[13px] font-medium text-[#1E293B]">Enable email notifications</p>
              <p className="text-[12px] text-[#64748B]">Send alerts for leave approvals and payroll.</p>
            </div>
            <input type="checkbox" defaultChecked className="size-4 rounded border-[#E2E8F0]" />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-[13px] font-medium text-[#1E293B]">Require MFA for Admins</p>
              <p className="text-[12px] text-[#64748B]">Enforce Multi-Factor Authentication.</p>
            </div>
            <input type="checkbox" className="size-4 rounded border-[#E2E8F0]" />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="h-9 rounded-md bg-[#1E293B] px-4 text-[13px] font-medium text-white hover:bg-[#0F172A]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
