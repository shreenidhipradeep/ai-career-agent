import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const what = searchParams.get("what") || "software engineer";
  const where = searchParams.get("where") || "bangalore";

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return NextResponse.json(
      { error: "Adzuna credentials are not configured in environment variables." },
      { status: 500 }
    );
  }

  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: "Adzuna request failed" }, { status: res.status });
    }

    const data = await res.json();
    const jobs = data.results || [];

    let savedCount = 0;
    let skippedCount = 0;

    for (const job of jobs) {
      if (!job.adref) continue;

      // Check if job already exists in database
      const existingJob = await prisma.job.findUnique({
        where: { externalId: job.adref },
      });

      if (existingJob) {
        skippedCount++;
      } else {
        await prisma.job.create({
          data: {
            externalId: job.adref,
            title: job.title,
            company: job.company?.display_name || "Unknown",
            location: job.location?.display_name || where,
            description: job.description || "",
            source: "adzuna",
          },
        });
        savedCount++;
      }
    }

    return NextResponse.json({ savedCount, skippedCount, total: jobs.length });
  } catch (error: any) {
    console.error("Error fetching or saving jobs:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

