"use client"
import { useState } from "react"

export default function ScanInbox() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function scan() {
    setLoading(true)
    const res = await fetch("/api/gmail/scan")
    const data = await res.json()
    setSuggestions(data.suggestions || [])
    setLoading(false)
  }

  async function confirm(applicationId: string, status: string) {
    await fetch(`/api/applications/${applicationId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setSuggestions((prev) => prev.filter((s) => s.applicationId !== applicationId))
  }

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <button onClick={scan} disabled={loading}>{loading ? "Scanning..." : "Scan Inbox"}</button>
      {suggestions.map((s) => (
        <div key={s.applicationId} style={{ border: "1px solid #ddd", padding: "0.75rem", marginTop: "0.5rem", borderRadius: "8px" }}>
          <p>"{s.subject}" looks like <b>{s.suggestedStatus}</b> for <b>{s.company}</b></p>
          <button onClick={() => confirm(s.applicationId, s.suggestedStatus)}>Confirm</button>
          <button onClick={() => setSuggestions((prev) => prev.filter((x) => x.applicationId !== s.applicationId))}>Dismiss</button>
        </div>
      ))}
    </div>
  )
}
