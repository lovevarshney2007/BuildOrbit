"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteSiteAction } from "@/lib/actions/site"
import { Trash2 } from "lucide-react"

export function DeleteSiteButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this site? This action cannot be undone.")) return
    
    setIsDeleting(true)
    try {
      const result = await deleteSiteAction(id)
      if (!result.success) {
        alert(result.message || "Failed to delete site")
      } else {
        router.refresh()
      }
    } catch (err) {
      alert("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
      title="Delete Site"
    >
      <Trash2 size={18} />
    </button>
  )
}
