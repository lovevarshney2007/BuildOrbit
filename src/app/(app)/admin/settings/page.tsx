import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) redirect("/dashboard")

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Settings"
        description="Manage system-wide configuration."
      />

      <div className="max-w-2xl rounded-xl shadow-sm border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="text-[14px] font-semibold text-on-surface">Organization Profile</h2>
        <p className="mb-4 text-[13px] text-secondary">
          Update your company details and working preferences.
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-on-surface">Company Name</label>
            <input
              type="text"
              defaultValue="BuildOrbit Inc."
              className="h-9 w-full rounded-md border border-outline-variant px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-on-surface">Timezone</label>
              <select
                className="h-9 w-full rounded-md border border-outline-variant px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option>UTC (Coordinated Universal Time)</option>
                <option>Asia/Kolkata (IST)</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-on-surface">Work Week Starts</label>
              <select
                className="h-9 w-full rounded-md border border-outline-variant px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option>Monday</option>
                <option>Sunday</option>
              </select>
            </div>
          </div>

          <hr className="my-2 border-outline-variant" />

          <h2 className="text-[14px] font-semibold text-on-surface">System Preferences</h2>
          <p className="mb-2 text-[13px] text-secondary">
            Configure default behaviors for the application.
          </p>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-[13px] font-medium text-on-surface">Enable email notifications</p>
              <p className="text-[12px] text-secondary">Send alerts for leave approvals and payroll.</p>
            </div>
            <input type="checkbox" defaultChecked className="size-4 rounded border-outline-variant" />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-[13px] font-medium text-on-surface">Require MFA for Admins</p>
              <p className="text-[12px] text-secondary">Enforce Multi-Factor Authentication.</p>
            </div>
            <input type="checkbox" className="size-4 rounded border-outline-variant" />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="h-9 rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
