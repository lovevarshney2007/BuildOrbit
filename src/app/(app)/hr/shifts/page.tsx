import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function createShiftAction(formData: FormData) {
  "use server"
  const user = await getCurrentUser()
  if (!user || !["HR","ADMIN","SUPER_ADMIN"].includes(user.role)) redirect("/dashboard")

  await prisma.shift.create({
    data: {
      name: formData.get("name") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      gracePeriodMins: Number(formData.get("gracePeriodMins") || 15),
    }
  })
  revalidatePath("/hr/shifts")
}

async function toggleShiftAction(id: string, isActive: boolean) {
  "use server"
  await prisma.shift.update({ where: { id }, data: { isActive: !isActive } })
  revalidatePath("/hr/shifts")
}

async function assignEmployeeToShiftAction(formData: FormData) {
  "use server"
  const user = await getCurrentUser()
  if (!user || !["HR","ADMIN","SUPER_ADMIN"].includes(user.role)) redirect("/dashboard")

  const shiftId = formData.get("shiftId") as string
  const employeeId = formData.get("employeeId") as string

  if (shiftId && employeeId) {
    // Check if assignment exists
    const existing = await prisma.shiftAssignment.findFirst({
      where: { employeeId, shiftId }
    })
    
    if (existing) {
      await prisma.shiftAssignment.update({
        where: { id: existing.id },
        data: { isActive: true }
      })
    } else {
      await prisma.shiftAssignment.create({
        data: { shiftId, employeeId, isActive: true, effectiveFrom: new Date() }
      })
    }
    revalidatePath("/hr/shifts")
  }
}

export default async function ShiftsPage() {
  const user = await getCurrentUser()
  if (!user || !["HR", "ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/dashboard")

  const [shifts, employees] = await Promise.all([
    prisma.shift.findMany({
      orderBy: { startTime: "asc" },
      include: { assignments: { where: { isActive: true }, include: { employee: { include: { user: true } } } } }
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      include: { user: { select: { name: true } } },
      orderBy: { employeeCode: "asc" }
    })
  ])

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight">Shift Management</h1>
          <p className="text-secondary dark:text-slate-400 mt-1">Define shift policies and assign employees to shifts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Shift Form */}
        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-on-surface dark:text-white mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            Create New Shift
          </h2>
          <form action={createShiftAction} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Shift Name</label>
              <input name="name" required placeholder="e.g., Morning Shift" className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Start Time</label>
                <input name="startTime" type="time" required defaultValue="09:00" className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">End Time</label>
                <input name="endTime" type="time" required defaultValue="18:00" className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Grace Period (mins)</label>
              <input name="gracePeriodMins" type="number" defaultValue="15" min="0" max="60" className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Create Shift
            </button>
          </form>
        </div>

        {/* Shifts List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {shifts.length === 0 ? (
            <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-secondary opacity-50 block mb-2">schedule</span>
              <p className="text-secondary dark:text-slate-400">No shifts defined yet. Create one on the left!</p>
            </div>
          ) : (
            shifts.map(shift => (
              <div key={shift.id} className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface dark:text-white">{shift.name}</h3>
                      <p className="text-sm text-secondary dark:text-slate-400">{shift.startTime} → {shift.endTime} · {shift.gracePeriodMins}min grace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${shift.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {shift.isActive ? "Active" : "Inactive"}
                    </span>
                    <form action={toggleShiftAction.bind(null, shift.id, shift.isActive)}>
                      <button type="submit" className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-secondary dark:text-slate-400">
                        {shift.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-secondary dark:text-slate-500 uppercase tracking-wider">
                      Assigned Employees ({shift.assignments.length})
                    </p>
                    <form action={assignEmployeeToShiftAction} className="flex items-center gap-2">
                      <input type="hidden" name="shiftId" value={shift.id} />
                      <select name="employeeId" required className="text-xs bg-surface-container dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded px-2 py-1 text-on-surface dark:text-white max-w-[150px]">
                        <option value="">Add employee...</option>
                        {employees.filter(e => !shift.assignments.some(a => a.employeeId === e.id)).map(e => (
                          <option key={e.id} value={e.id}>{e.user.name || e.employeeCode}</option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90">+</button>
                    </form>
                  </div>
                  {shift.assignments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No employees assigned yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {shift.assignments.map(a => (
                        <span key={a.id} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                          {a.employee.user.name || a.employee.employeeCode}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
