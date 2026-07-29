import { NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"
import { findCandidateApplications } from "@/src/lib/emailMatch"
import { classifyEmail } from "@/lib/groq"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Not logged in" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const account = await prisma.account.findFirst({ where: { userId: user!.id, provider: "google" } })
  if (!account?.access_token) return NextResponse.json({ error: "No Gmail access" }, { status: 400 })

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: account.access_token })
  const gmail = google.gmail({ version: "v1", auth: oauth2Client })

  try {
    const list = await gmail.users.messages.list({ userId: "me", maxResults: 10, q: "newer_than:7d" })
    const suggestions = []

    for (const msg of list.data.messages || []) {
      const full = await gmail.users.messages.get({ userId: "me", id: msg.id! })
      const headers = full.data.payload?.headers || []
      const subject = headers.find((h) => h.name === "Subject")?.value || ""
      const from = headers.find((h) => h.name === "From")?.value || ""
      const snippet = full.data.snippet || ""

      const { candidates } = await findCandidateApplications(user!.id, from, subject)
      if (candidates.length === 0) continue

      const result = await classifyEmail(subject, snippet, candidates.map((c) => c.job.company))
      if (result.label === "Other") continue

      const matchedApp = candidates.find((c) => c.job.company === result.company) || candidates[0]
      suggestions.push({ applicationId: matchedApp.id, company: matchedApp.job.company, suggestedStatus: result.label, subject })
    }

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error("Scan Inbox Error:", error)
    return NextResponse.json({ error: error.message || "Failed to scan inbox" }, { status: 500 })
  }
}
