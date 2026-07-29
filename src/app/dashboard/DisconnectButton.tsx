"use client"

export default function DisconnectButton() {
  return (
    <button
      onClick={() => alert("Disconnect logic added on Day 24")}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: "1px solid #ccc",
        background: "none",
        cursor: "pointer",
      }}
    >
      Disconnect Email
    </button>
  )
}
