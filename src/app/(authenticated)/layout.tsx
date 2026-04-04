import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import FloatingActionButton from "@/components/FloatingActionButton";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, image: true },
  });

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            🎬 CineJournal
          </Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">
            <span className="sidebar-icon">🏠</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/library" className="sidebar-link">
            <span className="sidebar-icon">📚</span>
            <span>Library</span>
          </Link>
          <Link href="/my-list" className="sidebar-link">
            <span className="sidebar-icon">📋</span>
            <span>My Lists</span>
          </Link>
          <Link href="/profile" className="sidebar-link">
            <span className="sidebar-icon">👤</span>
            <span>Profile</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <ThemeSwitcher />
          <div className="sidebar-user">
            {dbUser?.image ? (
              <img src={dbUser.image} alt={dbUser.displayName} className="user-avatar-img" />
            ) : (
              <span className="user-avatar">
                {dbUser?.displayName?.[0]?.toUpperCase() ?? "U"}
              </span>
            )}
            <span className="user-name">{dbUser?.displayName ?? "User"}</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="sidebar-logout">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* FAB - visible on mobile and desktop */}
      <FloatingActionButton />

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link href="/dashboard" className="bottom-nav-link">
          <span className="bottom-nav-icon">🏠</span>
          <span>Home</span>
        </Link>
        <Link href="/library" className="bottom-nav-link">
          <span className="bottom-nav-icon">📚</span>
          <span>Library</span>
        </Link>
        <Link href="/my-list" className="bottom-nav-link">
          <span className="bottom-nav-icon">📋</span>
          <span>Lists</span>
        </Link>
        <Link href="/profile" className="bottom-nav-link">
          <span className="bottom-nav-icon">👤</span>
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
