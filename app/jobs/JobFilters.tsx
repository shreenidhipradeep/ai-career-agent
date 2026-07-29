"use client"
import { useRouter, useSearchParams } from "next/navigation"

export default function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const what = formData.get("what") as string
    const where = formData.get("where") as string

    const params = new URLSearchParams()
    if (what) params.set("what", what)
    if (where) params.set("where", where)

    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
      <input name="what" placeholder="Keyword (e.g. developer)" defaultValue={searchParams.get("what") || ""} />
      <input name="where" placeholder="Location (e.g. chennai)" defaultValue={searchParams.get("where") || ""} />
      <button type="submit">Search</button>
    </form>
  )
}
