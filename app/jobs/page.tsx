import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { calculateMatch } from "@/lib/matchScore"
import JobFilters from "./JobFilters"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ what?: string; where?: string }>
}) {
  const { what, where } = await searchParams
  const session = await auth()

  // If a search was submitted, pull fresh jobs from Adzuna first
  if (what || where) {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    await fetch(
      `${baseUrl}/api/jobs/search?what=${encodeURIComponent(what || "")}&where=${encodeURIComponent(where || "")}`,
      { cache: "no-store" }
    )
  }

  const jobs = await prisma.job.findMany({
    where: {
      ...(what && { title: { contains: what, mode: "insensitive" } }),
      ...(where && { location: { contains: where, mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
  })

  let profile = null
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Browse Jobs</h1>
      <JobFilters />
      <p>{jobs.length} jobs found</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
        {jobs.map((job) => {
          const match = profile ? calculateMatch(profile.skills, job.extractedSkills) : null
          return (
            <div key={job.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{job.title}</h2>
              <p style={{ margin: "0.25rem 0", color: "#555" }}>{job.company}</p>
              <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>{job.location}</p>
              {match && (
                <p style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                  {match.percent}% match — <span style={{ fontWeight: "normal" }}>{match.explanation}</span>
                </p>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
