import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const piece = await prisma.mailPiece.findUnique({
    where: { id },
    include: { mailbox: { include: { members: true } } },
  });
  if (!piece) return NextResponse.json({ error: "not found" }, { status: 404 });

  const isMember = piece.mailbox.members.some((m) => m.userId === session.user!.id);
  if (!isMember) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const updated = await prisma.mailPiece.update({
    where: { id },
    data: {
      isRead: typeof body.isRead === "boolean" ? body.isRead : undefined,
      isFlagged: typeof body.isFlagged === "boolean" ? body.isFlagged : undefined,
      requestedAction: typeof body.requestedAction === "string" ? body.requestedAction : undefined,
    },
  });

  return NextResponse.json(updated);
}
