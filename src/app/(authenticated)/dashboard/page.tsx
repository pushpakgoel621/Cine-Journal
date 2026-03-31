import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AddEntryForm from "@/components/logging/AddEntryForm";
import Link from "next/link";

async function getWatchlistReminders(userId: string) {
  return prisma.watchLog.findMany({
    where: { userId, watchStatus: "TO_WATCH" },
    orderBy: { createdAt: "asc" },
    take: 10,
  });
}

async function getHallOfFame(userId: string) {
  return prisma.watchLog.findMany({
    where: { userId, watchStatus: "WATCHED", rating: { gte: 4.5 } },
    orderBy: { rating: "desc" },
    take: 20,
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [reminders, hallOfFame] = userId
    ? await Promise.all([
        getWatchlistReminders(userId),
        getHallOfFame(userId),
      ])
    : [[], []];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back, {session?.user?.name ?? "Cinephile"} 🎬</h1>
        <p className="dashboard-subtitle">
          Your personal movie journal awaits
        </p>
      </header>

      {/* Watchlist Reminders */}
      <section className="dashboard-section">
        <h2>📋 Watchlist Reminders</h2>
        {reminders.length > 0 ? (
          <div className="reminder-list">
            {reminders.map((log) => (
              <div key={log.id} className="reminder-card">
                {log.posterUrl ? (
                  <img
                    src={log.posterUrl}
                    alt={log.title}
                    className="reminder-poster"
                  />
                ) : (
                  <div className="reminder-no-poster">🎬</div>
                )}
                <div className="reminder-info">
                  <span className="reminder-title">{log.title}</span>
                  {log.genre && (
                    <span className="reminder-genre">{log.genre}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No movies in your watchlist yet. Start adding some!</p>
          </div>
        )}
      </section>

      {/* Hall of Fame */}
      <section className="dashboard-section">
        <h2>🏆 Hall of Fame</h2>
        {hallOfFame.length > 0 ? (
          <div className="hall-of-fame">
            <div className="carousel-track">
              {hallOfFame.map((log) => (
                <div key={log.id} className="carousel-card">
                  {log.posterUrl ? (
                    <img
                      src={log.posterUrl}
                      alt={log.title}
                      className="carousel-poster"
                    />
                  ) : (
                    <div className="carousel-no-poster">
                      <span>🏆</span>
                      <span className="carousel-no-poster-title">
                        {log.title}
                      </span>
                    </div>
                  )}
                  <div className="carousel-overlay">
                    <span className="carousel-title">{log.title}</span>
                    <span className="carousel-rating">
                      {"★".repeat(Math.round(log.rating ?? 0))} {log.rating}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Rate your favorite movies 5 stars to see them here.</p>
          </div>
        )}
      </section>

      {/* Quick Add Section */}
      <section className="dashboard-section">
        <h2>➕ Quick Add</h2>
        <AddEntryForm />
      </section>
    </div>
  );
}
