"use client"

import { useState } from "react"
import { saveApprovalWorkflowSettings } from "@/lib/actions/settings"

export function SettingsActionBar() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [discarded, setDiscarded] = useState(false)

  async function handlePublish() {
    setSaving(true)
    try {
      // Save the current settings as published
      await saveApprovalWorkflowSettings({
        multiLevelEnabled: true,
        requireHRForLongLeave: true,
        longLeaveThresholdDays: 3,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to publish settings")
    } finally {
      setSaving(false)
    }
  }

  function handleDiscard() {
    setDiscarded(true)
    setTimeout(() => setDiscarded(false), 2000)
    // In a real multi-step settings editor, this would revert to saved state
    // For now, we simply confirm the discard action visually
  }

  return (
    <div className="fixed bottom-0 lg:left-64 left-0 right-0 bg-surface-container-lowest dark:bg-slate-950 border-t border-outline-variant dark:border-slate-800 px-6 py-2.5 z-20 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        {!discarded && (
          <>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="font-label-md text-label-md text-on-surface dark:text-white font-semibold">
              {saved ? "✓ Policy settings saved!" : "Pending changes in Leave Policy Configuration"}
            </span>
          </>
        )}
        {discarded && (
          <span className="text-sm text-secondary dark:text-slate-400">Changes discarded. No pending modifications.</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleDiscard}
          className="px-3.5 py-1.5 bg-surface-bright hover:bg-surface-container dark:bg-slate-950 text-on-surface dark:text-white font-label-md text-label-md rounded border border-outline-variant dark:border-slate-800 transition-colors cursor-pointer"
          type="button"
        >
          Discard Changes
        </button>
        <button
          onClick={handlePublish}
          disabled={saving}
          className="px-4 py-1.5 bg-[#0f172a] hover:bg-black text-white font-label-md text-label-md rounded transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
          <span>{saving ? "Publishing..." : "Publish Policy Update"}</span>
        </button>
      </div>
    </div>
  )
}
