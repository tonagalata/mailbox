import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { guessCategory } from "@/lib/categories";

const SIGNING_KEY = process.env.MAILGUN_WEBHOOK_SIGNING_KEY ?? "";

// Mailgun HMAC-SHA256 verification.
// https://documentation.mailgun.com/docs/mailgun/user-manual/receive-forward-store/#securing-webhooks
function verifySignature(timestamp: string, token: string, signature: string): boolean {
  if (!SIGNING_KEY) return false;

  // Reject stale webhooks (> 5 minutes old).
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (age > 300) return false;

  const expected = createHmac("sha256", SIGNING_KEY)
    .update(timestamp + token)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

// Mailgun inbound webhook — multipart/form-data.
// Configure a Mailgun Route/Inbound Webhook that FORWARDs to:
//   https://<your-domain>/api/webhooks/inbound-mail
//
// Relevant form fields Mailgun sends:
//   recipient   — the envelope "To" address (match against mailbox.inboundAddress)
//   sender      — the envelope "From"
//   subject     — message subject
//   timestamp   — Unix seconds (string)
//   token       — random nonce
//   signature   — HMAC-SHA256(timestamp+token, signing_key)
//   attachment-count — number of attached files
//   attachment-1 … attachment-N — File objects
export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
  }

  const timestamp = formData.get("timestamp") as string | null;
  const token = formData.get("token") as string | null;
  const signature = formData.get("signature") as string | null;

  if (!timestamp || !token || !signature || !verifySignature(timestamp, token, signature)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rawRecipient = formData.get("recipient") as string | null;
  const sender = formData.get("sender") as string | null;
  const subject = (formData.get("subject") as string | null) ?? "Scanned mail";

  if (!rawRecipient) {
    return NextResponse.json({ error: "missing recipient" }, { status: 400 });
  }

  // Mailgun may send "Display Name <email@domain>" — extract just the address.
  const match = rawRecipient.match(/<([^>]+)>/);
  const recipient = (match ? match[1] : rawRecipient).trim().toLowerCase();

  const mailbox = await prisma.mailbox.findUnique({ where: { inboundAddress: recipient } });
  if (!mailbox) {
    return NextResponse.json({ error: "no mailbox matches recipient", recipient }, { status: 404 });
  }

  const attachmentCount = parseInt((formData.get("attachment-count") as string | null) ?? "0", 10);
  let imageFile: File | null = null;

  for (let i = 1; i <= attachmentCount; i++) {
    const file = formData.get(`attachment-${i}`);
    if (file instanceof File && file.type.startsWith("image/")) {
      imageFile = file;
      break;
    }
  }

  if (!imageFile) {
    return NextResponse.json({ error: "no image attachment found" }, { status: 400 });
  }

  const buffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const scanImageUrl = `data:${imageFile.type};base64,${base64}`;

  const piece = await prisma.mailPiece.create({
    data: {
      mailboxId: mailbox.id,
      sender: sender ?? undefined,
      subjectGuess: subject,
      category: guessCategory(subject),
      scanImageUrl,
    },
  });

  return NextResponse.json({ ok: true, id: piece.id });
}
