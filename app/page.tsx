import Image from "next/image";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-24 px-8 md:px-16 bg-white dark:bg-zinc-950 shadow-md md:rounded-2xl my-8 sm:items-start border border-zinc-100 dark:border-zinc-900">
        <div className="w-full flex justify-between items-center mb-12">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          
          <div>
            {session ? (
              <div className="flex items-center gap-4">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User profile"}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-blue-500/20"
                  />
                )}
                <span className="hidden sm:inline text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {session.user?.name || session.user?.email}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 shadow-sm rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Sign In with Google
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            AI Career Agent
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Securely log in to build your professional profile, score job matches with AI, and track all your applications in one single place.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 w-full sm:flex-row mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900">
          {session ? (
            <div className="flex flex-wrap gap-4">
              <Link
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white font-semibold transition-all hover:bg-blue-500 shadow-md hover:shadow-lg px-8"
                href="/profile"
              >
                Go to My Profile
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm px-8"
                href="/jobs"
              >
                Browse Jobs
              </Link>
              <Link
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm px-8"
                href="/dashboard"
              >
                My Applications
              </Link>
            </div>
          ) : (
            <div className="text-sm text-zinc-500 dark:text-zinc-400 italic">
              Please sign in above to access your profile.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}