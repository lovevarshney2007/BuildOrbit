import { AppShell } from "@/components/layout/AppShell"

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * The (app) route group layout wraps every protected application page
 * with the AppShell (Sidebar + Header + main content area).
 *
 * When authentication is implemented, session checks will be added here.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>
}
