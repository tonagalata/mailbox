import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const mailboxes = await prisma.mailbox.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { pieces: { where: { isRead: false } } } } },
  });

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar mailboxes={mailboxes} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar user={session.user} />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
