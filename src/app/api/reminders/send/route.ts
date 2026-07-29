import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const interviews = await prisma.interview.findMany({
    where: { scheduledAt: { gte: new Date(), lte: tomorrow } },
    include: { application: { include: { user: true, job: true } } },
  })

  for (const interview of interviews) {
    if (interview.application.user.email) {
      await resend.emails.send({
        from: "reminders@yourdomain.com",
        to: interview.application.user.email,
        subject: `Reminder: interview for ${interview.application.job.title}`,
        html: `<p>You have a ${interview.type} interview coming up for ${interview.application.job.title} at ${interview.application.job.company}.</p>`,
      })
    }
  }

  return NextResponse.json({ sent: interviews.length })
}
