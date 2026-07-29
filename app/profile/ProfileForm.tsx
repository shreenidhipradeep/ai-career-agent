"use client";

import { useState } from "react";

interface ProfileData {
  skills: string;
  targetRole: string;
  location: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  summary: string | null;
  experience: string | null;
}

interface ProfileFormProps {
  initialData: ProfileData | null;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [skills, setSkills] = useState(initialData?.skills || "");
  const [targetRole, setTargetRole] = useState(initialData?.targetRole || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [workMode, setWorkMode] = useState(initialData?.workMode || "remote");
  const [salaryMin, setSalaryMin] = useState(initialData?.salaryMin?.toString() || "");
  const [salaryMax, setSalaryMax] = useState(initialData?.salaryMax?.toString() || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [experience, setExperience] = useState(initialData?.experience || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("Saving...");

    const data = {
      skills,
      targetRole,
      location,
      workMode,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      summary: summary || null,
      experience: experience || null,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("Saved!");
        // Clear message after 3 seconds
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("Error saving profile");
      }
    } catch (err) {
      setStatus("Error saving profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Skills (comma separated)
        </label>
        <input
          name="skills"
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="TypeScript, React, Python, Docker"
          className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Target Role
        </label>
        <input
          name="targetRole"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="Full Stack Engineer"
          className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Location
        </label>
        <input
          name="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="New York, NY"
          className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Work Mode
        </label>
        <select
          name="workMode"
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          required
        >
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Salary Min ($)
          </label>
          <input
            name="salaryMin"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="80000"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Salary Max ($)
          </label>
          <input
            name="salaryMax"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="120000"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Professional Summary
        </label>
        <textarea
          name="summary"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Experienced developer..."
          className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Work Experience (one line per role: Title | Company | Start | End | Key achievement)
        </label>
        <textarea
          name="experience"
          rows={5}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Software Engineer | Acme Corp | 2022 | Present | Built a React dashboard used by 10k users"
          className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>

      <div className="pt-4 flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg shadow-sm hover:shadow transition-all"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

        {status && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              status === "Saved!"
                ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                : status === "Saving..."
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
            }`}
          >
            {status}
          </div>
        )}
      </div>
    </form>
  );
}