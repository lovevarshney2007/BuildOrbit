"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { createInvoice } from "@/lib/actions/invoice"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

type ClientType = {
  id: string
  name: string
  company: string | null
}

export function InvoiceCreateDialog({ clients }: { clients: ClientType[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createInvoice(formData)
      setIsOpen(false)
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to create invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Invoice
      </Button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-on-surface dark:text-white">Create Invoice</h2>
              <button onClick={() => setIsOpen(false)} className="text-secondary hover:text-on-surface dark:text-slate-400 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface dark:text-white">Client *</label>
                <select name="clientId" required className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary">
                  <option value="">Select a client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface dark:text-white">Invoice Number *</label>
                <input name="invoiceNumber" required placeholder="e.g. INV-2023-001" className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-on-surface dark:text-white">Amount *</label>
                  <input type="number" step="0.01" name="amount" required defaultValue={0} className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-on-surface dark:text-white">Tax</label>
                  <input type="number" step="0.01" name="tax" defaultValue={0} className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-on-surface dark:text-white">Status *</label>
                  <select name="status" defaultValue="DRAFT" required className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary">
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-on-surface dark:text-white">Due Date *</label>
                  <input type="date" name="dueDate" required className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface dark:text-white">Notes</label>
                <textarea name="notes" rows={2} placeholder="Optional notes for client" className="w-full bg-transparent border border-outline-variant dark:border-slate-700 rounded-lg px-4 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary"></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Create Invoice"}</Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
