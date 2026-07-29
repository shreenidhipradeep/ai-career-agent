"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function InterviewScheduler({
  applicationId,
  existingInterviews = [],
}: {
  applicationId: string
  existingInterviews?: { id: string; scheduledAt: string | Date; type: string }[]
}) {
  const router = useRouter()
  const [date, setDate] = useState("")
  const [type, setType] = useState("Technical")
  const [submitting, setSubmitting] = useState(false)

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, date, type }),
      })
      if (res.ok) {
        setDate("")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed #eee" }}>
      <h3 style={{ fontSize: "0.95rem", margin: "0 0 0.5rem 0" }}>Schedule Interview</h3>
      
      {existingInterviews.length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#666", margin: "0 0 0.25rem 0", fontWeight: "bold" }}>Scheduled Interviews:</p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#444" }}>
            {existingInterviews.map((iv) => (
              <li key={iv.id}>
                {iv.type} on {new Date(iv.scheduledAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSchedule} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ fontSize: "0.85rem", padding: "0.25rem" }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ fontSize: "0.85rem", padding: "0.25rem" }}
        >
          <option value="Technical">Technical</option>
          <option value="Behavioral">Behavioral</option>
          <option value="HR Phone Screen">HR Phone Screen</option>
          <option value="Manager Round">Manager Round</option>
          <option value="Onsite">Onsite</option>
        </select>
        <button
          type="submit"
          disabled={submitting}
          style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
        >
          {submitting ? "Scheduling..." : "Schedule"}
        </button>
      </form>
    </div>
  )
}
