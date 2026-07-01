import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { guessCategory } from "@/lib/categories";

const WEBHOOK_SECRET = process.env.INBOUND_WEBHOOK_SECRET ?? "";

// Postmark inbound webhook — JSON body.
// Setup:
//   1. Postmark → Server → Settings → Inbound → set webhook URL to:
//        https://<your-domain>/api/webhooks/inbound-mail?secret=<INBOUND_WEBHOOK_SECRET>
//   2. Set INBOUND_WEBHOOK_SECRET to any random string in your env.
function verifySecret(req: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return false;
  const provided = new URL(req.url).searchParams.get("secret") ?? "";
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(WEBHOOK_SECRET));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  // Postmark inbound payload field names:
  //   ToFull[0].Email  — envelope recipient
  //   FromFull.Email   — envelope sender
  //   Subject          — message subject
  //   Attachments[]    — { Name, ContentType, Content (base64), ContentLength }
  const toAddress: string | undefined = payload.ToFull?.[0]?.Email ?? payload.To;
  const fromAddress: string | undefined = payload.FromFull?.Email ?? payload.From;
  const subject: string = payload.Subject ?? "Scanned mail";
  const attachments: Array<{ Name: string; ContentType: string; Content: string }> =
    payload.Attachments ?? [];

  if (!toAddress) {
    return NextResponse.json({ error: "missing recipient" }, { status: 400 });
  }

  const recipient = toAddress.trim().toLowerCase();

  const mailbox = await prisma.mailbox.findUnique({ where: { inboundAddress: recipient } });
  if (!mailbox) {
    // Return 200 so Postmark doesn't retry — this address simply isn't configured.
    return NextResponse.json({ ok: false, reason: "no mailbox matches recipient", recipient });
  }

  const imageAttachment = attachments.find((a) => a.ContentType?.startsWith("image/"));
  if (!imageAttachment) {
    // Return 200 so Postmark doesn't retry — email had no image attachment (e.g. test ping).
    return NextResponse.json({ ok: false, reason: "no image attachment" });
  }

  const scanImageUrl = `data:${imageAttachment.ContentType};base64,${imageAttachment.Content}`;

  const piece = await prisma.mailPiece.create({
    data: {
      mailboxId: mailbox.id,
      sender: fromAddress,
      subjectGuess: subject,
      category: guessCategory(subject),
      scanImageUrl,
    },
  });

  return NextResponse.json({ ok: true, id: piece.id });
}
