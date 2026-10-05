"use client"

import { useState } from "react"
import { uploadEmployeeDocument, deleteEmployeeDocument } from "@/lib/actions/documents"
import { EmployeeDocumentType, EmployeeDocument } from "@prisma/client"

export function DocumentUploader({ 
  employeeId, 
  existingDocs 
}: { 
  employeeId: string, 
  existingDocs: EmployeeDocument[] 
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsUploading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    try {
      await uploadEmployeeDocument(employeeId, formData)
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err.message || "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document?")) return
    try {
      await deleteEmployeeDocument(docId)
    } catch (err: any) {
      alert(err.message || "Delete failed")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Document Type</label>
          <select name="documentType" required className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:ring-1 focus:ring-primary">
            <option value="ID_PROOF">ID Proof (Aadhar/Passport)</option>
            <option value="ADDRESS_PROOF">Address Proof</option>
            <option value="BANK_DETAILS">Bank Check/Passbook</option>
            <option value="OFFER_LETTER">Offer Letter</option>
            <option value="CONTRACT">Contract</option>
            <option value="RESUME">Resume</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Title / Description</label>
          <input name="title" type="text" required placeholder="e.g., Aadhar Card Front" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-on-surface dark:text-white focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1.5 block">File (PDF/Image)</label>
          <input name="file" type="file" required accept=".pdf,image/*" className="w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90" />
        </div>
        <div className="md:col-span-3 flex items-center justify-between mt-2">
          <p className="text-xs text-red-500">{error}</p>
          <button type="submit" disabled={isUploading} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 disabled:opacity-50">
            {isUploading ? "Uploading to Cloudinary..." : "Upload Document"}
          </button>
        </div>
      </form>

      {/* Existing Documents */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Uploaded Documents</h3>
        {existingDocs.length === 0 ? (
          <p className="text-sm text-slate-400">No documents uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {existingDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">{doc.mimeType.includes("pdf") ? "picture_as_pdf" : "image"}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface dark:text-white truncate">{doc.title}</p>
                    <p className="text-xs text-secondary dark:text-slate-400 truncate">{doc.documentType} · {(doc.sizeBytes / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={doc.storageKey} target="_blank" rel="noopener noreferrer" className="p-1.5 text-secondary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </a>
                  <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-secondary hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
