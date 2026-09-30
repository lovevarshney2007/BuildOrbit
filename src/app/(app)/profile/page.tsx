import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./client-form"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const employee = await prisma.employee.findFirst({
    where: { userId: user.userId },
    include: {
      department: true,
      designation: true,
    }
  })

  return (
    <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto w-full">
      {/* Subheader Navigation / Breadcrumb & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-label-sm font-label-sm text-secondary">
          <span className="text-on-surface font-semibold">{user.name || "My Profile"}</span>
        </div>
      </div>

      {/* SECTION 1: EMPLOYEE IDENTITY HEADER BANNER */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{user.name || user.email}</h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Active
                </span>
                {employee && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-secondary border border-outline-variant font-mono">
                    {employee.employeeCode}
                  </span>
                )}
              </div>
              <p className="font-body-lg text-body-lg text-secondary mt-1">
                {employee?.designation?.title || user.role} <span className="text-outline-variant mx-1">•</span> {employee?.department?.name || "No Department"}
              </p>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-label-sm font-label-sm text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-outline">mail</span>
                  <span className="font-mono text-on-surface">{user.email}</span>
                </div>
                {employee?.phone && (
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-outline">call</span>
                    <span className="font-mono text-on-surface">{employee.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {employee && (
            <div className="flex items-center gap-3 border-t xl:border-t-0 xl:border-l border-outline-variant pt-4 xl:pt-0 xl:pl-6 w-full xl:w-auto">
              <div className="flex flex-col px-3 py-2 bg-surface-bright border border-outline-variant rounded min-w-[120px]">
                <span className="text-label-sm font-label-sm text-secondary">Joined Date</span>
                <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5">{employee.joiningDate.toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: OVERVIEW TAB WORKSPACE (DENSE PANEL GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: Employment & Organizational Details */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">corporate_fare</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Employment Details</h2>
              </div>
            </div>
            <dl className="space-y-3.5 text-body-md font-body-md">
              <div className="flex items-start justify-between pb-2 border-b border-surface-container">
                <dt className="text-secondary text-label-md font-label-md">Department</dt>
                <dd className="text-right text-on-surface font-semibold max-w-[60%]">
                  {employee?.department?.name || "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between pb-2 border-b border-surface-container">
                <dt className="text-secondary text-label-md font-label-md">System Role</dt>
                <dd className="text-right text-on-surface font-medium">
                  {user.role}
                </dd>
              </div>

              {employee && (
                <div className="flex items-start justify-between pb-2 border-b border-surface-container">
                  <dt className="text-secondary text-label-md font-label-md">Basic Salary</dt>
                  <dd className="text-right text-on-surface font-mono font-semibold">
                    <span className="px-2 py-0.5 bg-surface-container-low text-primary border border-outline-variant rounded text-label-sm font-label-sm">
                      ${Number(employee.basicSalary).toLocaleString()}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* COLUMN 2 & 3: Personal Information Form */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">person</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Personal Information</h2>
            </div>
          </div>
          <div className="flex-1">
            {employee ? (
              <ProfileForm 
                initialData={{
                  phone: employee.phone || "",
                  address: employee.address || "",
                  dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.toISOString().split("T")[0] : "",
                }}
              />
            ) : (
              <div className="text-[13px] text-secondary p-4 bg-surface-container-low rounded">
                No employee record found for your user account. Please contact HR.
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
