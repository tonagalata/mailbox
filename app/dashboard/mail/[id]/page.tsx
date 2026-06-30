import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import CategoryBadge from "@/components/category-badge";
import MailActions from "@/components/mail-actions";

export default async function MailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const piece = await prisma.mailPiece.findUnique({
    where: { id },
    include: { mailbox: { include: { members: true } } },
  });

  if (!piece || !piece.mailbox.members.some((m) => m.userId === session.user!.id)) {
    notFound();
  }

  if (!piece.isRead) {
    await prisma.mailPiece.update({ where: { id }, data: { isRead: true } });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to all mail
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
          <div className="relative aspect-[4/5] w-full bg-line">
            <Image
              src={piece.scanImageUrl}
              alt={`Scan of mail from ${piece.sender ?? "unknown sender"}`}
              fill
              className="object-cover"
              unoptimized={piece.scanImageUrl.startsWith("data:")}
            />
          </div>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp">
            {format(new Date(piece.receivedAt), "EEEE, MMMM d 'at' h:mm a")}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            {piece.sender ?? "Unknown sender"}
          </h1>
          <p className="mt-1 text-slate">{piece.subjectGuess ?? "Scanned mail"}</p>

          <div className="mt-4 flex items-center gap-2">
            <CategoryBadge category={piece.category} />
            <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] text-slate-light">
              {piece.mailbox.label}
            </span>
          </div>

          <div className="mt-7 border-t border-line pt-6">
            <MailActions
              id={piece.id}
              isFlagged={piece.isFlagged}
              requestedAction={piece.requestedAction}
            />
          </div>

          <div className="mt-7 rounded-card border border-dashed border-line bg-white/60 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-light">
              How this works
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate">
              Your carrier scans the envelope and forwards it to your dedicated mailbox
              address. Request &ldquo;shred&rdquo;, &ldquo;forward&rdquo;, or &ldquo;open &amp; scan
              contents&rdquo; and they&rsquo;ll handle the rest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
