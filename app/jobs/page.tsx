import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { calculateMatch } from "@/lib/matchScore"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function JobsPage({ searchParams }: PageProps) {
  const session = await auth()
  const params = await searchParams
  const queryWhat = typeof params.what === "string" ? params.what : ""
  const queryWhere = typeof params.where === "string" ? params.where : ""
  const action = typeof params.action === "string" ? params.action : "search"

  let errorMsg = ""
  let successMsg = ""

  // If the user explicitly clicked "Sync Live", trigger the Adzuna API fetch
  if (action === "sync" && (queryWhat || queryWhere)) {
    const appId = process.env.ADZUNA_APP_ID
    const appKey = process.env.ADZUNA_APP_KEY

    if (appId && appKey) {
      const what = queryWhat || "software engineer"
      const where = queryWhere || "bangalore"
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}`

      try {
        const res = await fetch(url, { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          const apiJobs = data.results || []

          let newJobsCount = 0
          for (const job of apiJobs) {
            if (!job.adref) continue
            // Check if job already exists in database
            const existingJob = await prisma.job.findUnique({
              where: { externalId: job.adref },
            })

            if (!existingJob) {
              await prisma.job.create({
                data: {
                  externalId: job.adref,
                  title: job.title,
                  company: job.company?.display_name || "Unknown",
                  location: job.location?.display_name || where,
                  description: job.description || "",
                  source: "adzuna",
                },
              })
              newJobsCount++
            }
          }
          successMsg = `Successfully synced database! Found ${newJobsCount} new jobs.`
        } else {
          errorMsg = "Adzuna API returned an error response."
        }
      } catch (err) {
        console.error("Adzuna fetch error:", err)
        errorMsg = "Failed to fetch latest real-time jobs from Adzuna API."
      }
    } else {
      errorMsg = "Adzuna credentials are not configured in environment variables."
    }
  }

  // Fetch jobs from database to display
  let jobs = []
  if (queryWhat || queryWhere) {
    // Filter by query if searched
    jobs = await prisma.job.findMany({
      where: {
        OR: [
          { title: { contains: queryWhat, mode: "insensitive" } },
          { company: { contains: queryWhat, mode: "insensitive" } },
          { description: { contains: queryWhat, mode: "insensitive" } },
        ],
        location: { contains: queryWhere, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
    })
  } else {
    // Fallback to all jobs
    jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } })
  }

  let profile = null
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    })
    profile = user?.profile || null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm p-6 sm:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Browse Jobs
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {jobs.length} jobs found
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-all dark:text-zinc-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back Home
          </Link>
        </div>

        {/* Search & Sync Form */}
        <form method="GET" action="/jobs" className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-900 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="what" className="sr-only">Job Title or Keyword</label>
              <input
                type="text"
                name="what"
                id="what"
                defaultValue={queryWhat}
                placeholder="Job Title, Keywords (e.g. React, Node)"
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="where" className="sr-only">Location</label>
              <input
                type="text"
                name="where"
                id="where"
                defaultValue={queryWhere}
                placeholder="Location (e.g. Bangalore, London)"
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="submit"
              name="action"
              value="search"
              className="px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all"
            >
              Search Database (0 API Requests)
            </button>
            <button
              type="submit"
              name="action"
              value="sync"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all"
            >
              Sync Live (1 API Request)
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 text-sm text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400 rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Job Listings */}
        <div className="flex flex-col gap-4">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const match = profile ? calculateMatch(profile.skills, job.extractedSkills) : null

              return (
                <div
                  key={job.id}
                  className="border border-zinc-100 dark:border-zinc-900 rounded-xl p-5 hover:shadow-md transition-all bg-white dark:bg-zinc-950"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{job.title}</h2>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">{job.company}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{job.location}</p>
                    </div>
                    {match && (
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          match.percent >= 75
                            ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            : match.percent >= 40
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            : "bg-zinc-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                        }`}>
                          {match.percent}% Match
                        </span>
                      </div>
                    )}
                  </div>
                  {match && (
                    <div className="mt-4 pt-3 border-t border-zinc-50 dark:border-zinc-900/50">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">AI Score Explanation:</span>{" "}
                        {match.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No jobs found. Try typing a query above to search or sync live.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
