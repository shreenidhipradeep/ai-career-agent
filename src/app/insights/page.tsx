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

  const applicationsWithJobs = await prisma.application.findMany({
    where: { userId: user.id },
    include: { job: true },
  })

  const skillCounts: Record<string, number> = {}
  applicationsWithJobs.forEach((a) => {
    if (!a.job.extractedSkills) return
    try {
      const skills: string[] = JSON.parse(a.job.extractedSkills)
      skills.forEach((s) => {
        skillCounts[s] = (skillCounts[s] || 0) + 1
      })
    } catch (e) {
      console.error("Error parsing job skills:", e)
    }
  })

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  const userSkills = (profile?.skills || "").toLowerCase()

  const missingSkills = Object.entries(skillCounts)
    .filter(([skill]) => !userSkills.includes(skill.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

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

      <h2 style={{ marginTop: "2rem" }}>Top Missing Skills</h2>
      {missingSkills.length > 0 ? (
        <ul>
          {missingSkills.map(([skill, count]) => (
            <li key={skill}>
              <strong>{skill}</strong>: missing in {count} job application(s)
            </li>
          ))}
        </ul>
      ) : (
        <p>No missing skills found. Great job matching!</p>
      )}
    </main>
  )
}
