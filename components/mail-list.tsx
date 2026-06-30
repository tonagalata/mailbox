"use client";

import Link from "next/link";
import { isToday, isYesterday, format } from "date-fns";
import { Flag, Mail as MailIcon } from "lucide-react";
import CategoryBadge from "@/components/category-badge";

type Piece = {
  id: string;
  sender: string | null;
  subjectGuess: string | null;
  category: string;
  receivedAt: Date;
  isRead: boolean;
  isFlagged: boolean;
  mailbox: { label: string };
};

function groupLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
}

export default function MailList({ pieces }: { pieces: Piece[] }) {
  if (pieces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white/50 py-24 text-center">
        <MailIcon className="text-slate-light" size={28} />
        <p className="mt-3 font-display text-lg text-ink">Nothing here yet</p>
        <p className="mt-1 max-w-xs text-sm text-slate">
          Scans from your mail carrier will show up here as soon as they arrive.
        </p>
      </div>
    );
  }

  const groups = new Map<string, Piece[]>();
  for (const p of pieces) {
    const key = groupLabel(new Date(p.receivedAt));
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([label, items]) => (
        <div key={label}>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-slate-light">
            {label}
          </p>
          <div className="space-y-2.5">
            {items.map((piece) => (
              <Link
                key={piece.id}
                href={`/dashboard/mail/${piece.id}`}
                className={`group flex items-center gap-4 rounded-card border bg-white px-5 py-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-stack ${
                  piece.isRead ? "border-line" : "border-stamp/30"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    piece.isRead ? "bg-transparent" : "bg-stamp"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate font-display text-base ${piece.isRead ? "text-slate" : "font-medium text-ink"}`}>
                      {piece.sender ?? "Unknown sender"}
                    </p>
                    {piece.isFlagged && <Flag size={13} className="shrink-0 text-stamp" />}
                  </div>
                  <p className="truncate text-sm text-slate">{piece.subjectGuess ?? "Scanned mail"}</p>
                </div>
                <CategoryBadge category={piece.category} />
                <span className="font-mono text-xs text-slate-light">
                  {format(new Date(piece.receivedAt), "h:mm a")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
