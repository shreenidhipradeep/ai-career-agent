import { NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const account = await prisma.account.findFirst({ where: { userId: user!.id, provider: "google" } })

  if (!account?.access_token) {
    return NextResponse.json({ error: "No Gmail access token" }, { status: 400 })
  }

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: account.access_token })
  const gmail = google.gmail({ version: "v1", auth: oauth2Client })

  try {
    const res = await gmail.users.messages.list({ userId: "me", maxResults: 5 })
    return NextResponse.json({ count: res.data.messages?.length || 0 })
  } catch (error: any) {
    console.error("Gmail API test error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch Gmail data" }, { status: 500 })
  }
}
