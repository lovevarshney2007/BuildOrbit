import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check — redirect to login if not authenticated
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return <AppShell user={user}>{children}</AppShell>
}
