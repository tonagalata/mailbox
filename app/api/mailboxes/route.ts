import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  label: z.string().trim().min(1).max(100),
  physicalAddress: z.string().trim().min(1).max(200),
  inboundAddress: z.string().trim().toLowerCase().email(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fields." }, { status: 400 });
  }

  const { label, physicalAddress, inboundAddress } = parsed.data;

  const existing = await prisma.mailbox.findUnique({ where: { inboundAddress } });
  if (existing) {
    return NextResponse.json({ error: "That inbound address is already in use." }, { status: 409 });
  }

  const mailbox = await prisma.mailbox.create({
    data: {
      label,
      physicalAddress,
      inboundAddress,
      members: { create: { userId: session.user.id, role: "owner" } },
    },
  });

  return NextResponse.json(mailbox, { status: 201 });
}
