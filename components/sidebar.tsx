import Link from "next/link";
import { Inbox, Flag, Archive, Settings, MailPlus } from "lucide-react";

type MailboxRow = {
  id: string;
  label: string;
  physicalAddress: string;
  inboundAddress: string;
  _count: { pieces: number };
};

export default function Sidebar({ mailboxes }: { mailboxes: MailboxRow[] }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between bg-navy px-5 py-7 text-paper md:flex">
      <div>
        <Link href="/dashboard" className="font-display text-xl font-semibold tracking-tight">
          Inbox &amp; Ink
        </Link>

        <nav className="mt-9 space-y-1">
          <SidebarLink href="/dashboard" icon={<Inbox size={17} />} label="All mail" active />
          <SidebarLink href="/dashboard?filter=flagged" icon={<Flag size={17} />} label="Flagged" />
          <SidebarLink href="/dashboard?filter=read" icon={<Archive size={17} />} label="Archived" />
        </nav>

        <div className="mt-9">
          <p className="px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
            Mailboxes
          </p>
          <div className="mt-2 space-y-1">
            {mailboxes.map((mb) => (
              <div
                key={mb.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-paper/90 hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{mb.label}</p>
                  <p className="truncate text-xs text-paper/40">{mb.physicalAddress}</p>
                </div>
                {mb._count.pieces > 0 && (
                  <span className="ml-2 shrink-0 rounded-full bg-stamp px-2 py-0.5 font-mono text-[10px] font-medium text-paper">
                    {mb._count.pieces}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <SidebarLink href="/dashboard/settings" icon={<Settings size={17} />} label="Settings" />
        <div className="mt-3 rounded-lg border border-dashed border-paper/20 p-3">
          <div className="flex items-center gap-2 text-paper/70">
            <MailPlus size={15} />
            <p className="font-mono text-[10px] uppercase tracking-widest">Forward scans to</p>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-paper">
            {mailboxes[0]?.inboundAddress ?? "—"}
          </p>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
        active ? "bg-white/10 font-medium text-paper" : "text-paper/70 hover:bg-white/5 hover:text-paper"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
