import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MailList from "@/components/mail-list";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { filter } = await searchParams;

  const pieces = await prisma.mailPiece.findMany({
    where: {
      mailbox: { members: { some: { userId: session.user.id } } },
      ...(filter === "flagged" ? { isFlagged: true } : {}),
      ...(filter === "read" ? { isRead: true } : {}),
    },
    orderBy: { receivedAt: "desc" },
    include: { mailbox: { select: { label: true } } },
  });

  const unreadCount = pieces.filter((p) => !p.isRead).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp">
            {filter === "flagged" ? "Flagged" : filter === "read" ? "Archived" : "All mail"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            {unreadCount > 0 ? `${unreadCount} new scan${unreadCount === 1 ? "" : "s"}` : "All caught up"}
          </h1>
        </div>
      </div>

      <MailList pieces={pieces} />
    </div>
  );
}
