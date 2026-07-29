"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function GenerateButton({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch("/api/applications/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.applicationId) router.push(`/applications/${data.applicationId}/review`)
  }

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? "Generating..." : "Generate Application"}
    </button>
  )
}