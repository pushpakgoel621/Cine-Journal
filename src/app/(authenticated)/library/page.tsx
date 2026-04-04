import LibraryClient from "@/components/library/LibraryClient";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Library | CineJournal",
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });

  return <LibraryClient collections={collections} />;
}
