import Link from "next/link";
import LoginForm from "@/components/login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp">
            Inbox &amp; Ink
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-slate">
            View the latest scans from your mail carrier.
          </p>
        </div>
        <div className="rounded-card border border-line bg-white p-7 shadow-card">
          <LoginForm searchParams={searchParams} />
        </div>
        <p className="mt-6 text-center font-mono text-xs text-slate-light">
          demo@example.com / password123
        </p>
        <p className="mt-2 text-center text-sm text-slate">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-navy hover:text-navy-light">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
