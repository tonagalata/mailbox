import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-paper">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Inbox &amp; Ink
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-ink shadow-card transition hover:border-navy"
        >
          Sign in
        </Link>
      </nav>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-12 md:grid-cols-2">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-stamp">
            Postmarked today
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            Your mailbox,
            <br />
            <span className="italic text-stamp">scanned</span> and sorted.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate">
            Every envelope your carrier scans lands here first — sorted by sender,
            flagged for bills, and ready before you've even checked the box.
          </p>
          <div className="mt-9 flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-navy px-7 py-3 text-sm font-medium text-paper shadow-card transition hover:bg-navy-light"
            >
              Open dashboard
            </Link>
            <span className="font-mono text-xs text-slate-light">
              demo@example.com / password123
            </span>
          </div>
        </div>

        <div className="relative mx-auto h-[420px] w-full max-w-sm">
          {/* Stacked envelope signature element */}
          <div className="absolute inset-x-6 top-16 h-56 rotate-[-6deg] rounded-card border border-line bg-white shadow-stack" />
          <div className="absolute inset-x-3 top-10 h-56 rotate-[4deg] rounded-card border border-line bg-white shadow-stack" />
          <div className="absolute inset-x-0 top-4 flex h-60 flex-col justify-between rounded-card border border-line bg-white p-6 shadow-stack">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-light">
                  Scanned
                </p>
                <p className="font-display text-lg font-medium text-ink">Wells Fargo</p>
                <p className="text-sm text-slate">Account statement — June</p>
              </div>
              <span className="rounded-full bg-stamp-tint px-2.5 py-1 font-mono text-[10px] font-medium text-stamp">
                BILL
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <span className="font-mono text-xs text-slate-light">Today, 9:14 AM</span>
              <span className="h-9 w-9 rounded-full border-2 border-dashed border-stamp/60" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
