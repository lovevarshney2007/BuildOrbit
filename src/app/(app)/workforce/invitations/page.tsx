import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function sendInvitationAction(formData: FormData) {
  "use server"
  const user = await getCurrentUser()
  if (!user || !["HR", "ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/dashboard")

  const email = formData.get("email") as string
  const name = formData.get("name") as string | null
  const role = formData.get("role") as "ENGINEER" | "LEAD" | "HR"

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  // Upsert invitation (reset if already invited)
  const invitation = await prisma.employeeInvitation.upsert({
    where: { email },
    create: { email, name, role, invitedById: user.userId, expiresAt },
    update: { name, role, invitedById: user.userId, expiresAt, status: "PENDING", token: undefined }
  })

  // Send invitation email
  try {
    const { emailService } = await import("@/lib/services/email-service")
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invitation.token}`
    await emailService.sendMail({
      to: email,
      subject: "You're invited to join BuildOrbit!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
          <h2 style="color: #0f172a; margin-top: 0;">You're Invited to BuildOrbit!</h2>
          <p style="color: #334155;">Hello${name ? ` ${name}` : ""},</p>
          <p style="color: #334155;">You have been invited to join the BuildOrbit workforce management platform as a <strong>${role}</strong>.</p>
          <p style="color: #334155;">Click the link below to accept the invitation and set up your account. This link expires in 7 days.</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 10px; font-weight: bold;">Accept Invitation</a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">If you did not expect this invitation, please ignore this email.</p>
        </div>
      `
    })
  } catch (e) {
    console.error("Failed to send invitation email:", e)
  }

  revalidatePath("/workforce/invitations")
}

async function revokeInvitationAction(id: string) {
  "use server"
  await prisma.employeeInvitation.delete({ where: { id } })
  revalidatePath("/workforce/invitations")
}

export default async function InvitationsPage() {
  const user = await getCurrentUser()
  if (!user || !["HR", "ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/dashboard")

  const invitations = await prisma.employeeInvitation.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  })

  const now = new Date()

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-5xl mx-auto overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight">Employee Invitations</h1>
        <p className="text-secondary dark:text-slate-400 mt-1">Invite new employees to join the platform via email.</p>
      </div>

      {/* Invite Form */}
      <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-on-surface dark:text-white mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person_add</span>
          Send Invitation
        </h2>
        <form action={sendInvitationAction} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Email Address *</label>
            <input name="email" type="email" required placeholder="employee@company.com" className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Name (Optional)</label>
            <input name="name" type="text" placeholder="Full Name" className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Role</label>
            <select name="role" className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="ENGINEER">Engineer</option>
              <option value="LEAD">Lead</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Invitation Email
            </button>
          </div>
        </form>
      </div>

      {/* Invitation List */}
      <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800">
          <h3 className="font-semibold text-on-surface dark:text-white">Sent Invitations</h3>
        </div>
        {invitations.length === 0 ? (
          <div className="p-12 text-center text-secondary dark:text-slate-400">
            <span className="material-symbols-outlined text-4xl opacity-50 block mb-2">mail_outline</span>
            No invitations sent yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant dark:border-slate-800 text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Expires</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-slate-800 text-sm">
              {invitations.map(inv => {
                const isExpired = inv.expiresAt < now && inv.status === "PENDING"
                const statusLabel = inv.status === "ACCEPTED" ? "Accepted" : isExpired ? "Expired" : "Pending"
                const statusColor = inv.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : isExpired ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-5 font-medium text-on-surface dark:text-white">{inv.email}</td>
                    <td className="py-3 px-5 text-secondary dark:text-slate-400">{inv.name || "—"}</td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold uppercase tracking-wider">{inv.role}</span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{statusLabel}</span>
                    </td>
                    <td className="py-3 px-5 text-secondary dark:text-slate-400 text-xs">{inv.expiresAt.toLocaleDateString()}</td>
                    <td className="py-3 px-5 text-right">
                      {inv.status === "PENDING" && (
                        <form action={revokeInvitationAction.bind(null, inv.id)}>
                          <button type="submit" className="text-xs text-red-500 hover:underline font-semibold">Revoke</button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
