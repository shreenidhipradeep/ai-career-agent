import { prisma } from "@/lib/prisma"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"

export default async function InsightsPage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/")
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    redirect("/")
  }

  const applications = await prisma.application.findMany({
    where: { userId: user.id, status: { not: "Draft" } },
  })

  const counts: Record<string, number> = {}
  applications.forEach((a) => {
    counts[a.status] = (counts[a.status] || 0) + 1
  })

  const total = applications.length
  const responded = applications.filter((a) => a.status !== "Applied").length
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Insights</h1>
      <p>Total applications: {total}</p>
      <p>Response rate: {responseRate}%</p>
      {Object.entries(counts).map(([status, count]) => (
        <p key={status}>
          {status}: {count}
        </p>
      ))}
    </main>
  )
}
