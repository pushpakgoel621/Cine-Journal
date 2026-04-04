import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";

export const metadata = {
  title: "Profile | CineJournal",
  description: "Manage your CineJournal profile and preferences.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      image: true,
      coverImage: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="profile-page fade-in">
      <div className="page-header">
        <h1>Your Profile</h1>
        <p>Manage your account settings and customize your profile banner.</p>
      </div>

      <ProfileSettingsForm user={user} />
    </div>
  );
}
