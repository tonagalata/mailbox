import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const mailboxes = await prisma.mailbox.findMany({
    where: { members: { some: { userId: session.user.id } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp">Settings</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Account &amp; mailboxes</h1>

      <div className="mt-7 rounded-card border border-line bg-white p-6 shadow-card">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-light">Signed in as</p>
        <p className="mt-1 text-ink">{session.user.email}</p>
      </div>

      <div className="mt-5 space-y-4">
        {mailboxes.map((mb) => (
          <div key={mb.id} className="rounded-card border border-line bg-white p-6 shadow-card">
            <p className="font-display text-lg font-medium text-ink">{mb.label}</p>
            <p className="text-sm text-slate">{mb.physicalAddress}</p>
            <div className="mt-4 border-t border-line pt-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-light">
                Give this address to your mail carrier or scanning service
              </p>
              <p className="mt-1.5 select-all rounded-lg bg-paper px-3 py-2 font-mono text-sm text-navy">
                {mb.inboundAddress}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
