import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function classifyEmail(subject: string, snippet: string, candidateCompanies: string[]) {
  const prompt = `An email arrived with subject "${subject}" and snippet "${snippet}". 
Classify it as one of: Interview, Rejected, Shortlisted, Assessment, Other.
Also pick which company (if any) it most likely relates to from this list: ${candidateCompanies.join(", ")}.
Return ONLY JSON like {"label": "...", "company": "..." or null}. No explanation.`

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0 }),
  })
  const data = await res.json()
  try {
    return JSON.parse(data.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim() || "{}")
  } catch {
    return { label: "Other", company: null }
  }
}
