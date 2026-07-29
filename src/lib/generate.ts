async function callGroq(prompt: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ""
}

export async function generateTailoredResume(profileSummary: string, experience: string, jobDescription: string) {
  const prompt = `You are helping tailor a resume to a specific job. Using ONLY the facts below (do not invent experience), rewrite the summary and reorder/emphasize the experience to match what this job asks for.

Candidate summary: ${profileSummary}
Candidate experience: ${experience}

Job description: ${jobDescription}

Return the tailored resume as plain text with a "Summary" section and an "Experience" section. Stay factually accurate — only reword and reorder, never invent new skills or roles.`

  return callGroq(prompt)
}