import { auth } from "../../../auth"
import Link from "next/link"

export default async function Navbar() {
  const session = await auth()
  if (!session?.user) return null

  return (
    <nav style={{
      borderBottom: "1px solid #ddd",
      padding: "1rem 2rem",
      display: "flex",
      gap: "1.5rem",
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <Link href="/jobs" style={{ fontWeight: "bold", textDecoration: "none", color: "#333" }}>Jobs</Link>
        <Link href="/dashboard" style={{ fontWeight: "bold", textDecoration: "none", color: "#333" }}>Dashboard</Link>
        <Link href="/insights" style={{ fontWeight: "bold", textDecoration: "none", color: "#333" }}>Insights</Link>
        <Link href="/profile" style={{ fontWeight: "bold", textDecoration: "none", color: "#333" }}>Profile</Link>
      </div>
      <div style={{ fontSize: "0.9rem", color: "#666" }}>
        Signed in as: {session.user.name || session.user.email}
      </div>
    </nav>
  )
}
