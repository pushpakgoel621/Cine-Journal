import { auth, signOut } from "@/lib/auth";
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
  if (!session?.user) {
    redirect("/login");
  }

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
        </nav>
        <div className="sidebar-footer">
          <ThemeSwitcher />
          <div className="sidebar-user">
            <span className="user-avatar">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="user-name">{session.user.name}</span>
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
      </nav>
    </div>
  );
}
