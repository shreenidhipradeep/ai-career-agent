import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = await prisma.application.update({
    where: { id },
    data: { status: "Applied", appliedAt: new Date() },
  })
  return NextResponse.json(application)
}
