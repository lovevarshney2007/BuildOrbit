import { getCurrentUser } from "@/lib/session"
import { LandingPageClient } from "@/components/ui/LandingPageClient"

export default async function LandingPage() {
  const user = await getCurrentUser()
  return <LandingPageClient user={user} />
}
