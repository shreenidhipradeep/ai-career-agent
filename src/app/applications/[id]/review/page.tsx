// Review Page Placeholder
import prisma from "@/lib/prisma"
import ApproveButton from "./ApproveButton"

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = await prisma.application.findUnique({
    where: { id },
    include: { resume: true, coverLetter: true, job: true },
  })

  if (!application) return <p>Not found</p>

  return (
    <main style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Review: {application.job.title} at {application.job.company}</h1>

      <h2>Resume</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "1rem" }}>
        {application.resume?.content}
      </pre>

      <h2>Cover Letter</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "1rem" }}>
        {application.coverLetter?.content}
      </pre>

      <ApproveButton applicationId={application.id} />
    </main>
  )
}