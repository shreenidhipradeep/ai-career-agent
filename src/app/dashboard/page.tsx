import { prisma } from "@/lib/prisma"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import StatusUpdater from "./StatusUpdater"
import DisconnectButton from "./DisconnectButton"
import ScanInbox from "./ScanInbox"

const statusColors: Record<string, string> = {
  Draft: "#999",
  Applied: "#2E5C8A",
  Interview: "#1D9E75",
  Rejected: "#D85A30",
  Offer: "#639922",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const applications = await prisma.application.findMany({
    where: { userId: user!.id, status: { not: "Draft" } },
    include: { job: true },
    orderBy: { appliedAt: "desc" },
  })

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Applications</h1>
        <DisconnectButton />
      </div>
      <ScanInbox />
      <p>{applications.length} applications</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
        {applications.map((app) => (
          <div
            key={app.id}
            style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}
          >
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{app.job.title}</h2>
            <p style={{ margin: "0.25rem 0", color: "#555" }}>{app.job.company}</p>

            <span
              style={{
                display: "inline-block",
                padding: "0.2rem 0.6rem",
                borderRadius: "12px",
                background: statusColors[app.status] || "#999",
                color: "white",
                fontSize: "0.8rem",
              }}
            >
              {app.status}
            </span>

            <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "0.5rem" }}>
              Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}
            </p>

            <StatusUpdater
              applicationId={app.id}
              currentStatus={app.status}
              currentNotes={app.notes}
            />
          </div>
        ))}
      </div>
    </main>
  )
}