"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, Truck, Scissors, Forward } from "lucide-react";

const ACTIONS = [
  { value: "forward", label: "Forward to me", icon: Forward },
  { value: "shred", label: "Shred", icon: Scissors },
  { value: "open-and-scan-contents", label: "Open & scan contents", icon: Truck },
];

export default function MailActions({
  id,
  isFlagged,
  requestedAction,
}: {
  id: string;
  isFlagged: boolean;
  requestedAction: string | null;
}) {
  const router = useRouter();
  const [flagged, setFlagged] = useState(isFlagged);
  const [action, setAction] = useState(requestedAction);
  const [isPending, startTransition] = useTransition();

  async function patch(body: Record<string, unknown>) {
    await fetch(`/api/mail/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => {
          setFlagged((f) => !f);
          patch({ isFlagged: !flagged });
        }}
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
          flagged
            ? "border-stamp bg-stamp-tint text-stamp"
            : "border-line bg-white text-ink hover:border-stamp/40"
        }`}
      >
        <Flag size={15} />
        {flagged ? "Flagged" : "Flag this"}
      </button>

      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-light">
          Request action
        </p>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                const next = action === value ? null : value;
                setAction(next);
                patch({ requestedAction: next });
              }}
              disabled={isPending}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                action === value
                  ? "border-navy bg-navy text-paper"
                  : "border-line bg-white text-ink hover:border-navy/40"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
