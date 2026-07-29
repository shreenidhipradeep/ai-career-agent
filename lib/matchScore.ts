export function calculateMatch(profileSkills: string, extractedSkills: string | null) {
  if (!extractedSkills) return { percent: 0, explanation: "Not analyzed yet" }

  const userSkills = profileSkills.toLowerCase().split(",").map((s) => s.trim())
  const jobSkills: string[] = JSON.parse(extractedSkills)

  const matched = jobSkills.filter((skill) =>
    userSkills.some((us) => skill.toLowerCase().includes(us) || us.includes(skill.toLowerCase()))
  )

  const percent = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0
  const missing = jobSkills.filter((s) => !matched.includes(s))

  const explanation =
    matched.length > 0
      ? `Matches ${matched.length} of ${jobSkills.length} skills: ${matched.slice(0, 3).join(", ")}${missing.length > 0 ? `. Missing: ${missing.slice(0, 2).join(", ")}` : ""}`
      : "No strong skill overlap found"

  return { percent, explanation }
}
