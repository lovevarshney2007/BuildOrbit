import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FaceOnboarding } from "@/components/onboarding/FaceOnboarding"

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const employee = await prisma.employee.findUnique({
    where: { userId: user.userId }
  })

  // If already onboarded, send back to dashboard
  if (employee?.faceDescriptor) {
    redirect("/dashboard")
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-12 flex items-center justify-center w-full min-h-[calc(100vh-64px)]">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight">Welcome to BuildOrbit! 🎉</h1>
          <p className="text-secondary dark:text-slate-400 mt-2 max-w-lg mx-auto">
            Before you can access your dashboard and mark attendance, we need to set up your Face ID profile.
          </p>
        </div>
        
        <FaceOnboarding />
      </div>
    </main>
  )
}
