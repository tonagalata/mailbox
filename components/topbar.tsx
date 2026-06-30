import SignOutButton from "@/components/sign-out-button";
import { Search } from "lucide-react";

export default function Topbar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const initials = (user.name ?? user.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-line bg-paper/80 px-8 py-5 backdrop-blur">
      <div className="relative w-full max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
        <input
          placeholder="Search by sender or subject…"
          className="w-full rounded-full border border-line bg-white py-2 pl-9 pr-4 text-sm outline-none ring-stamp/20 transition focus:ring-2"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-display text-sm font-medium text-paper">
          {initials}
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-ink">{user.name ?? user.email}</p>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
