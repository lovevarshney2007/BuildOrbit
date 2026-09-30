import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./client-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const employee = await prisma.employee.findFirst({
    where: { userId: user.userId },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and view employment details."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employment Details (Read Only) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>Official records maintained by HR.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-[14px]">
              <div className="flex flex-col gap-1">
                <span className="text-[#64748B]">Name</span>
                <span className="font-medium text-[#1E293B]">{user.name || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#64748B]">Email</span>
                <span className="font-medium text-[#1E293B]">{user.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#64748B]">System Role</span>
                <Badge variant="outline" className="w-fit">{user.role}</Badge>
              </div>
              {employee && (
                <>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[#64748B]">Employee Code</span>
                    <span className="font-medium text-[#1E293B]">{employee.employeeCode}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#64748B]">Joining Date</span>
                    <span className="font-medium text-[#1E293B]">{employee.joiningDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#64748B]">Basic Salary</span>
                    <span className="font-medium text-[#1E293B]">${Number(employee.basicSalary).toLocaleString()}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personal Details Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact and personal details.</CardDescription>
            </CardHeader>
            <CardContent>
              {employee ? (
                <ProfileForm 
                  initialData={{
                    phone: employee.phone || "",
                    address: employee.address || "",
                    dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.toISOString().split("T")[0] : "",
                  }}
                />
              ) : (
                <div className="text-[13px] text-[#64748B]">
                  No employee record found for your user account. Please contact HR.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
