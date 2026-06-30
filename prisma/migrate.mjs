// One-shot migration script — run with: node --env-file .env prisma/migrate.mjs
// Uses the @libsql/client bundled inside @prisma/adapter-libsql (no extra deps).
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_DATABASE_URL is not set");
  process.exit(1);
}

const client = createClient({ url, authToken });

const statements = [
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT, "email" TEXT NOT NULL, "passwordHash" TEXT, "image" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,

  `CREATE TABLE IF NOT EXISTS "Mailbox" ("id" TEXT NOT NULL PRIMARY KEY, "label" TEXT NOT NULL, "physicalAddress" TEXT NOT NULL, "inboundAddress" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Mailbox_inboundAddress_key" ON "Mailbox"("inboundAddress")`,

  `CREATE TABLE IF NOT EXISTS "MailboxMember" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "mailboxId" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'owner', CONSTRAINT "MailboxMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "MailboxMember_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "Mailbox" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MailboxMember_userId_mailboxId_key" ON "MailboxMember"("userId", "mailboxId")`,

  `CREATE TABLE IF NOT EXISTS "MailPiece" ("id" TEXT NOT NULL PRIMARY KEY, "mailboxId" TEXT NOT NULL, "sender" TEXT, "subjectGuess" TEXT, "category" TEXT NOT NULL DEFAULT 'OTHER', "scanImageUrl" TEXT NOT NULL, "thumbnailUrl" TEXT, "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "isRead" BOOLEAN NOT NULL DEFAULT false, "isFlagged" BOOLEAN NOT NULL DEFAULT false, "requestedAction" TEXT, CONSTRAINT "MailPiece_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "Mailbox" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,

  `CREATE TABLE IF NOT EXISTS "Account" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL, "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT, CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`,

  `CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT NOT NULL PRIMARY KEY, "sessionToken" TEXT NOT NULL, "userId" TEXT NOT NULL, "expires" DATETIME NOT NULL, CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken")`,
];

for (const sql of statements) {
  await client.execute(sql);
}

console.log("Migration applied — all tables created.");
client.close();
