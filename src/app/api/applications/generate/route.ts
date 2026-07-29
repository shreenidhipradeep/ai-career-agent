import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"
import { generateTailoredResume, generateCoverLetter } from "@/src/lib/generate"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { jobId } = await req.json()

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const profile = await prisma.profile.findUnique({ where: { userId: user!.id } })
  const job = await prisma.job.findUnique({ where: { id: jobId } })

  if (!user || !profile || !job) {
    return NextResponse.json({ error: "Missing user, profile, or job" }, { status: 404 })
  }

  const application = await prisma.application.create({
    data: { userId: user.id, jobId: job.id, status: "Draft" },
  })

  const resumeContent = await generateTailoredResume(
    profile.summary || "", profile.experience || "", job.description || ""
  )
  const coverLetterContent = await generateCoverLetter(
    profile.summary || "", profile.targetRole, job.title, job.company, job.description || ""
  )

  await prisma.resume.create({ data: { applicationId: application.id, content: resumeContent } })
  await prisma.coverLetter.create({ data: { applicationId: application.id, content: coverLetterContent } })

  return NextResponse.json({ applicationId: application.id })
}