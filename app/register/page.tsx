import Link from "next/link";
import RegisterForm from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp">
            Inbox &amp; Ink
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Create an account</h1>
          <p className="mt-2 text-sm text-slate">
            Set up access to your scanned mail.
          </p>
        </div>
        <div className="rounded-card border border-line bg-white p-7 shadow-card">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-slate">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-navy hover:text-navy-light">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
