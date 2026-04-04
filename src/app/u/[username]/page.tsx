import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import MovieCard from "@/components/library/MovieCard";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { displayName: true, image: true }
  });

  if (!user) return { title: "User Not Found | CineJournal" };

  return {
    title: `${user.displayName} (@${username}) | CineJournal`,
    description: `Check out ${user.displayName}'s movie journal & custom lists!`,
    openGraph: {
      title: `${user.displayName} (@${username})`,
      description: `Check out ${user.displayName}'s movie journal & custom lists!`,
      images: [user.image || "/default-avatar.png"],
    }
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: { watchLogs: { where: { watchStatus: "WATCHED" } } }
      },
      collections: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          _count: { select: { items: true } }
        }
      },
      watchLogs: {
        where: { watchStatus: "WATCHED" },
        orderBy: { rating: "desc" },
        take: 4,
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Get Top Genre safely
  const genreGroup = await prisma.watchLog.groupBy({
    by: ["genre"],
    where: { userId: user.id, genre: { not: null } },
    _count: { genre: true },
    orderBy: { _count: { genre: "desc" } },
    take: 1,
  });
  const topGenre = genreGroup[0]?.genre || "N/A";

  const avgRatingGroup = await prisma.watchLog.aggregate({
    where: { userId: user.id, watchStatus: "WATCHED", rating: { not: null } },
    _avg: { rating: true },
  });
  const avgRating = avgRatingGroup._avg.rating?.toFixed(1) || "N/A";

  return (
    <div className="profile-page fade-in">
      {/* Banner */}
      <div className="profile-banner-wrapper">
        <div 
          className="profile-cover" 
          style={{ backgroundImage: user.coverImage ? `url(${user.coverImage})` : 'none' }} 
        />
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-container">
            {user.image ? (
              <img src={user.image} alt={user.displayName} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#fff' }}>
                {user.displayName[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <h2>{user.displayName}</h2>
        <p className="profile-email" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>@{user.username}</p>
        
        {/* Profile User Stats Widget */}
        <section className="dashboard-stats" style={{ margin: '2rem 0' }}>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-content">
              <span className="stat-label">Watched</span>
              <span className="stat-value">{user._count.watchLogs}</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <div className="stat-content">
              <span className="stat-label">Avg Rating</span>
              <span className="stat-value">{avgRating}</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎭</span>
            <div className="stat-content">
              <span className="stat-label">Top Genre</span>
              <span className="stat-value">{topGenre}</span>
            </div>
          </div>
        </section>

        {/* Public Collections */}
        <div className="dashboard-section" style={{ marginTop: '3rem' }}>
          <h2>📋 Public Lists</h2>
          {user.collections.length > 0 ? (
            <div className="collections-grid">
              {user.collections.map(c => (
                <div className="collection-card" key={c.id}>
                  <div className="collection-card-header">
                    <h3>{c.title}</h3>
                  </div>
                  {c.description && <p className="collection-desc">{c.description}</p>}
                  <div className="collection-meta">
                    <span className="collection-badge">{c._count.items} movies</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No public lists available.</p>
          )}
        </div>

        {/* Hall of Fame Snippet */}
        <div className="dashboard-section" style={{ marginTop: '3rem' }}>
          <h2>🎬 Top Rated Movies</h2>
          {user.watchLogs.length > 0 ? (
            <div className="movie-grid">
              {user.watchLogs.map(log => (
                <MovieCard
                  key={log.id}
                  id={log.id}
                  title={log.title}
                  posterUrl={log.posterUrl}
                  rating={log.rating}
                  emotions={log.emotions}
                  platform={log.platform}
                  watchedAt={log.watchedAt ? log.watchedAt.toISOString() : null}
                  genre={log.genre}
                  reviewText={log.reviewText}
                  watchStatus={log.watchStatus}
                  tmdbId={log.tmdbId}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state">No public watches recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
