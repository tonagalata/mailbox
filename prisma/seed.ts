import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import type { MailCategory } from "../lib/categories";

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const SAMPLE_IMAGE =
  "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      passwordHash,
    },
  });

  const mailbox = await prisma.mailbox.upsert({
    where: { inboundAddress: "scans+demo@inbound.yourdomain.com" },
    update: {},
    create: {
      label: "Home — 123 Main St",
      physicalAddress: "123 Main St, Springfield, USA",
      inboundAddress: "scans+demo@inbound.yourdomain.com",
      members: { create: { userId: user.id, role: "owner" } },
    },
  });

  const samples: Array<{
    sender: string;
    subjectGuess: string;
    category: MailCategory;
    daysAgo: number;
    isRead: boolean;
    isFlagged: boolean;
  }> = [
    { sender: "Wells Fargo", subjectGuess: "Account statement — June", category: "BILL", daysAgo: 0, isRead: false, isFlagged: true },
    { sender: "Amazon", subjectGuess: "Package notice", category: "PACKAGE", daysAgo: 0, isRead: false, isFlagged: false },
    { sender: "The New Yorker", subjectGuess: "June 30 issue", category: "MAGAZINE", daysAgo: 1, isRead: false, isFlagged: false },
    { sender: "City of Springfield", subjectGuess: "Property tax notice", category: "BILL", daysAgo: 1, isRead: true, isFlagged: true },
    { sender: "Jane Doe", subjectGuess: "Handwritten letter", category: "LETTER", daysAgo: 2, isRead: true, isFlagged: false },
    { sender: "Crate & Barrel", subjectGuess: "Summer catalog", category: "CATALOG", daysAgo: 3, isRead: true, isFlagged: false },
    { sender: "Blue Cross", subjectGuess: "Explanation of benefits", category: "BILL", daysAgo: 4, isRead: true, isFlagged: false },
    { sender: "Unknown sender", subjectGuess: "Postcard", category: "OTHER", daysAgo: 5, isRead: true, isFlagged: false },
  ];

  for (const s of samples) {
    const receivedAt = new Date();
    receivedAt.setDate(receivedAt.getDate() - s.daysAgo);
    await prisma.mailPiece.create({
      data: {
        mailboxId: mailbox.id,
        sender: s.sender,
        subjectGuess: s.subjectGuess,
        category: s.category,
        scanImageUrl: SAMPLE_IMAGE,
        thumbnailUrl: SAMPLE_IMAGE,
        receivedAt,
        isRead: s.isRead,
        isFlagged: s.isFlagged,
      },
    });
  }

  console.log("Seeded demo user: demo@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
