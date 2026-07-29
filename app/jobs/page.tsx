import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { calculateMatch } from "@/lib/matchScore"
import Link from "next/link"

export default async function JobsPage() {
  const session = await auth()
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } })

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

        <div className="flex flex-col gap-4">
          {jobs.map((job) => {
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
          })}
        </div>
      </div>
    </div>
  )
}
