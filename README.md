# Inbox & Ink — Mail Scan Dashboard

A Stripe-style dashboard for physical mail your carrier scans and emails to you.
Built with Next.js 15 (App Router), Tailwind CSS, NextAuth v5, and Prisma on **Turso** (libSQL).

## What's here

- **Authentication** — email/password (NextAuth Credentials provider + Prisma adapter). Swap in Google/Microsoft OAuth easily if you'd rather your users sign in that way.
- **Dashboard** — scans grouped by day, flagging, category badges (bill, package, letter, magazine, catalog), and a detail view for each scan.
- **Multi-tenant mailboxes** — each physical address is a `Mailbox` with its own unique inbound email address, so the app supports more than one address/user from day one.
- **Inbound webhook** — `POST /api/webhooks/inbound-mail` receives the scan as soon as your carrier's email arrives, ready to plug into Postmark Inbound, Mailgun Routes, or SendGrid Inbound Parse.

## 1. Install & configure

```bash
npm install
cp .env.example .env
```

Create the Turso database (skip if you already have one):

```bash
# install the CLI once: curl -sSfL https://get.tur.so/install.sh | bash
turso db create mail-dashboard
turso db show mail-dashboard --url     # -> TURSO_DATABASE_URL
turso db tokens create mail-dashboard  # -> TURSO_AUTH_TOKEN
```

Paste those two values into `.env`, then:

```bash
npx auth secret              # generates AUTH_SECRET for you
npm run db:push              # creates tables from prisma/schema.prisma
npm run db:seed              # demo user + sample scans
npm run dev
```

Demo login: `demo@example.com` / `password123`

**Local dev without a real Turso DB:** set `TURSO_DATABASE_URL="file:./dev.db"`
and leave `TURSO_AUTH_TOKEN` blank — Turso's libSQL client talks to a local
SQLite file directly, no network required. Swap in the real `libsql://...` URL
and token whenever you're ready to deploy.

## 2. Connect your mail carrier's scans

Your carrier (or a scanning service like a virtual mailbox provider) emails each
scan to an address you give them. The flow:

1. Pick a transactional email provider with **inbound parsing**: Postmark Inbound, Mailgun Routes, or SendGrid Inbound Parse all work.
2. Set up a receiving domain there (e.g. `inbound.yourdomain.com`) and point its MX records at the provider, per their docs.
3. Configure the provider to POST each incoming message as JSON to `https://yourapp.com/api/webhooks/inbound-mail`.
4. In your database, each `Mailbox` row has a unique `inboundAddress` (e.g. `scans+demo@inbound.yourdomain.com`) — give that exact address to your carrier. The webhook matches incoming mail to the right mailbox/user by that address.
5. Set `INBOUND_WEBHOOK_SECRET` in `.env` and configure your provider to send it back as an `X-Webhook-Secret` header, so random requests can't post fake scans.

The webhook in `app/api/webhooks/inbound-mail/route.ts` is written against a
Postmark-shaped payload (`ToFull`, `FromFull`, `Attachments`) — adjust the field
names at the top of the file to match whichever provider you choose. In
production, upload the attachment to object storage (S3, Cloudflare R2, or
Vercel Blob) instead of storing it inline, and save the resulting URL.

## 3. Add more users / mailboxes

Create additional rows in `Mailbox` and `MailboxMember` to give a user access to
an address (a household can share one mailbox; a property manager can have one
per unit). There's no UI for this yet — add it as an admin screen or seed it
directly, depending on how many addresses you're managing.

## Project structure

```
app/
  page.tsx                     marketing landing page
  login/                       sign-in
  dashboard/
    layout.tsx                 auth guard + sidebar shell
    page.tsx                   scan list, grouped by day
    mail/[id]/page.tsx         single scan detail + actions
    settings/page.tsx          account + inbound address
  api/
    auth/[...nextauth]/        NextAuth route handlers
    webhooks/inbound-mail/     receives carrier scan emails
    mail/[id]/                 mark read / flag / request action
components/                    UI building blocks
prisma/schema.prisma           User, Mailbox, MailPiece models
```

## Notes

- Styling follows a distinct "paper + postal stamp" visual identity (Fraunces display serif, Inter body, JetBrains Mono for metadata) rather than default Tailwind grays — see `tailwind.config.ts` for the token system.
- Swap the Credentials provider in `lib/auth.ts` for an OAuth provider (Google, Microsoft) if you don't want to manage passwords yourself.
