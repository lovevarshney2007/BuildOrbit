"use client"

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-primary text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-primary/90 flex items-center gap-2"
    >
      <span className="material-symbols-outlined">print</span> Print / Save PDF
    </button>
  )
}
