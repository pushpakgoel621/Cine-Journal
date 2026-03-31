"use client";

import { useState } from "react";

interface MovieCardProps {
  id: string;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  emotions: string[];
  platform: string | null;
  watchedAt: string | null;
  genre: string | null;
  watchStatus: string;
}

export default function MovieCard({
  title,
  posterUrl,
  rating,
  emotions,
  platform,
  watchedAt,
  genre,
  watchStatus,
}: MovieCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`movie-card ${isFlipped ? "movie-card-flipped" : ""}`}
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }}
    >
      <div className="movie-card-inner">
        {/* Front: Poster */}
        <div className="movie-card-front">
          {posterUrl ? (
            <img src={posterUrl} alt={title} className="movie-card-poster" />
          ) : (
            <div className="movie-card-no-poster">
              <span className="movie-card-emoji">🎬</span>
              <span className="movie-card-no-poster-title">{title}</span>
            </div>
          )}
          {watchStatus === "TO_WATCH" && (
            <span className="movie-card-badge">To Watch</span>
          )}
          {rating && (
            <div className="movie-card-rating-badge">
              ★ {rating}
            </div>
          )}
        </div>

        {/* Back: Details */}
        <div className="movie-card-back">
          <h3 className="movie-card-back-title">{title}</h3>

          {rating && (
            <div className="movie-card-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? "star-active" : "star-inactive"}
                >
                  ★
                </span>
              ))}
            </div>
          )}

          {genre && <span className="movie-card-detail">{genre}</span>}

          {emotions.length > 0 && (
            <div className="movie-card-emotions">
              {emotions.slice(0, 3).map((e) => (
                <span key={e} className="movie-card-emotion-tag">
                  {e}
                </span>
              ))}
            </div>
          )}

          {platform && (
            <span className="movie-card-detail">📺 {platform}</span>
          )}

          {watchedAt && (
            <span className="movie-card-detail">
              📅 {new Date(watchedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
