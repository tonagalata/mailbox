"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMailboxForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [inboundAddress, setInboundAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/mailboxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, physicalAddress, inboundAddress }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't create mailbox.");
      return;
    }

    setLabel("");
    setPhysicalAddress("");
    setInboundAddress("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-navy/40 hover:text-navy"
      >
        + Add mailbox
      </button>
    );
  }

  return (
    <div className="rounded-card border border-line bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-medium text-ink">New mailbox</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="mb-label" className="mb-1.5 block text-sm font-medium text-ink">
            Label
          </label>
          <input
            id="mb-label"
            type="text"
            required
            placeholder="Home — 123 Main St"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none ring-stamp/30 transition focus:bg-white focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="mb-physical" className="mb-1.5 block text-sm font-medium text-ink">
            Physical address
          </label>
          <input
            id="mb-physical"
            type="text"
            required
            placeholder="123 Main St, Springfield, USA"
            value={physicalAddress}
            onChange={(e) => setPhysicalAddress(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none ring-stamp/30 transition focus:bg-white focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="mb-inbound" className="mb-1.5 block text-sm font-medium text-ink">
            Mailgun inbound address
          </label>
          <input
            id="mb-inbound"
            type="email"
            required
            placeholder="scans@mg.yourdomain.com"
            value={inboundAddress}
            onChange={(e) => setInboundAddress(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none ring-stamp/30 transition focus:bg-white focus:ring-2"
          />
          <p className="mt-1.5 text-xs text-slate">
            The address your mail carrier sends scans to — must match the recipient Mailgun routes to this webhook.
          </p>
        </div>
        {error && <p role="alert" className="text-sm text-stamp">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-navy px-5 py-2 text-sm font-medium text-paper transition hover:bg-navy-light disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create mailbox"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null); }}
            className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition hover:border-navy/40"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
