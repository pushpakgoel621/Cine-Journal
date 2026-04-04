import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CollectionListClient from "@/components/collections/CollectionListClient";

export const metadata = {
  title: "My Lists | CineJournal",
  description: "Manage your custom movie collections",
};

export default async function CollectionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return (
    <div className="collections-page fade-in">
      <div className="page-header">
        <h1>Your Lists</h1>
        <p>Curate custom collections of your favorite movies.</p>
      </div>

      <CollectionListClient initialCollections={collections} />
    </div>
  );
}
