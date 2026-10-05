import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function InviteAcceptPage({ params }: { params: { token: string } }) {
  const invitation = await prisma.employeeInvitation.findUnique({
    where: { token: params.token }
  })

  const isValid = invitation && invitation.status === "PENDING" && invitation.expiresAt > new Date()

  if (invitation?.status === "ACCEPTED") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center">
        {isValid ? (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">waving_hand</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface dark:text-white mb-2">You&apos;re Invited!</h1>
            <p className="text-secondary dark:text-slate-400 mb-2">
              You&apos;ve been invited to join <strong>BuildOrbit</strong> as a <strong>{invitation.role.toLowerCase()}</strong>.
            </p>
            {invitation.name && (
              <p className="text-sm text-slate-500 mb-6">Welcome, {invitation.name}!</p>
            )}
            <Link
              href={`/register?email=${encodeURIComponent(invitation.email)}&token=${params.token}`}
              className="block w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              Accept & Create Account
            </Link>
            <p className="text-xs text-slate-400 mt-4">
              This invitation expires on {invitation.expiresAt.toLocaleDateString()}.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-red-500 text-3xl">link_off</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface dark:text-white mb-2">Invalid Link</h1>
            <p className="text-secondary dark:text-slate-400 mb-6">
              This invitation link is invalid or has expired. Please contact your HR administrator for a new invite.
            </p>
            <Link href="/login" className="block w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
