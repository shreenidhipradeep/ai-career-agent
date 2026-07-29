import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { applicationId, date, type } = await req.json()
    if (!applicationId || !date || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        scheduledAt: new Date(date),
        type,
      },
    })

    return NextResponse.json(interview)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
