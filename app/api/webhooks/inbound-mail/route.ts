import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { guessCategory } from "@/lib/categories";

const WEBHOOK_SECRET = process.env.INBOUND_WEBHOOK_SECRET ?? "";

// Postmark inbound webhook — JSON body.
// Setup:
//   1. Create a Postmark account → Servers → your server → Settings → Inbound
//   2. Set the webhook URL to:
//        https://<your-domain>/api/webhooks/inbound-mail
//   3. Under "Webhook credentials" set a username + password — use any values,
//      then set INBOUND_WEBHOOK_SECRET="username:password" in your env.
//   4. Point your inbound email address at the Postmark inbound server
//      (use the provided @inbound.postmarkapp.com address, or add MX records).
function verifyBasicAuth(req: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return false;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Basic ")) return false;
  const provided = Buffer.from(auth.slice(6), "base64").toString();
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(WEBHOOK_SECRET));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!verifyBasicAuth(req)) {
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
    return NextResponse.json({ error: "no mailbox matches recipient", recipient }, { status: 404 });
  }

  const imageAttachment = attachments.find((a) => a.ContentType?.startsWith("image/"));
  if (!imageAttachment) {
    return NextResponse.json({ error: "no image attachment found" }, { status: 400 });
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
