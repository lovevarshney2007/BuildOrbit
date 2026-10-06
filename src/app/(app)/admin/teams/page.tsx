import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { AnimatedCard } from "@/components/ui/AnimatedCard"
import { CreateTeamForm } from "./CreateTeamForm"
import { AssignMembersForm } from "./AssignMembersForm"

export const metadata = { title: "Teams Management | BuildOrbit" }

export default async function TeamsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    redirect("/dashboard")
  }

  // Fetch all teams
  const teams = await prisma.team.findMany({
    include: {
      lead: { include: { user: true } },
      members: { include: { user: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  // Fetch potential leads (role = LEAD)
  const potentialLeads = await prisma.employee.findMany({
    where: { user: { role: "LEAD" } },
    include: { user: true }
  })

  // Fetch engineers (role = ENGINEER) to assign to teams
  const engineers = await prisma.employee.findMany({
    where: { user: { role: "ENGINEER" } },
    include: { user: true }
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface dark:text-white">Teams Management</h1>
          <p className="text-secondary dark:text-slate-400">Create teams, assign leads, and manage members.</p>
        </div>
        <CreateTeamForm leads={potentialLeads} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {teams.map((team, idx) => (
          <AnimatedCard key={team.id} delay={idx * 0.1} className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-on-surface dark:text-white">{team.name}</h2>
                <p className="text-sm text-secondary dark:text-slate-400">{team.description || "No description provided."}</p>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                <span className="material-symbols-outlined text-primary text-sm" data-icon="person">person</span>
                <span className="text-sm font-medium text-primary">Lead: {team.lead?.user.name || "Unassigned"}</span>
              </div>
            </div>

            <div className="border-t border-outline-variant dark:border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-4">Team Members ({team.members.length})</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {team.members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {member.user.name?.charAt(0) || "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-on-surface dark:text-white truncate">{member.user.name}</p>
                      <p className="text-xs text-secondary dark:text-slate-400 truncate">{member.employeeCode}</p>
                    </div>
                  </div>
                ))}
                {team.members.length === 0 && (
                  <div className="text-sm text-secondary dark:text-slate-400 italic">No members assigned to this team yet.</div>
                )}
              </div>

              <AssignMembersForm teamId={team.id} currentMembers={team.members.map(m => m.id)} engineers={engineers} />
            </div>
          </AnimatedCard>
        ))}
        {teams.length === 0 && (
          <div className="text-center p-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2" data-icon="group_off">group_off</span>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No teams found</h3>
            <p className="text-slate-500 dark:text-slate-400">Create your first team to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
