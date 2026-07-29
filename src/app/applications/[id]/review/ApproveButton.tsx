"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ApproveButton({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    await fetch(`/api/applications/${applicationId}/approve`, { method: "POST" })
    setLoading(false)
    router.push("/dashboard")
  }

  return (
    <button onClick={handleApprove} disabled={loading}>
      {loading ? "Saving..." : "Approve & Mark as Applied"}
    </button>
  )
}
