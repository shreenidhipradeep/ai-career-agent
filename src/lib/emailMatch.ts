import { prisma } from "@/lib/prisma"
import { stringSimilarity } from "string-similarity-js"

export async function findCandidateApplications(userId: string, senderEmail: string, emailSubject: string) {
  const senderDomain = senderEmail.split("@")[1]?.toLowerCase() || ""

  const openApplications = await prisma.application.findMany({
    where: {
      userId,
      status: { in: ["Applied", "Interview"] },
      appliedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    include: { job: true },
  })

  // Layer 1: domain match
  const domainMatches = openApplications.filter(
    (app) => app.job.companyDomain?.toLowerCase() === senderDomain
  )
  if (domainMatches.length === 1) return { confidence: "high", candidates: domainMatches }

  // Layer 2: fuzzy name match against subject/sender
  const scored = openApplications
    .map((app) => ({
      app,
      score: stringSimilarity(app.job.company.toLowerCase(), emailSubject.toLowerCase()),
    }))
    .sort((a, b) => b.score - a.score)
    .filter((s) => s.score > 0.3)
    .slice(0, 3)

  return { confidence: "low", candidates: scored.map((s) => s.app) }
}
