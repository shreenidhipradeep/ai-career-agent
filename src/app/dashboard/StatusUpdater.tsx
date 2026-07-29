"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const STATUSES = ["Applied", "Interview", "Rejected", "Offer"]

export default function StatusUpdater({
  applicationId,
  currentStatus,
  currentNotes,
}: {
  applicationId: string
  currentStatus: string
  currentNotes: string | null
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes || "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/applications/${applicationId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ flex: 1, minWidth: "150px" }}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Update"}
      </button>
    </div>
  )
}