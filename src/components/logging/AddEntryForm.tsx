"use client";

import { useState } from "react";
import MovieSearch from "./MovieSearch";
import FeelingsPanel from "./FeelingsPanel";
import { useToast } from "@/components/Toast";

interface SearchResult {
  id: number;
  title: string;
  year: string;
  posterUrl: string | null;
  overview: string;
  genres: string[];
}

const PLATFORMS = [
  "Theater",
  "Netflix",
  "Prime Video",
  "Disney+",
  "HBO Max",
  "Apple TV+",
  "Hulu",
  "YouTube",
  "Local Media",
  "Other",
];

interface AddEntryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddEntryForm({ onSuccess, onCancel }: AddEntryFormProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Movie data (from search or manual)
  const [selectedMovie, setSelectedMovie] = useState<SearchResult | null>(null);
  const [manualTitle, setManualTitle] = useState("");

  // User data
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [platform, setPlatform] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [watchStatus, setWatchStatus] = useState<"WATCHED" | "TO_WATCH">("WATCHED");

  const handleMovieSelect = (movie: SearchResult) => {
    setSelectedMovie(movie);
    setManualTitle("");
  };

  const title = selectedMovie?.title || manualTitle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast("Please select or enter a movie title", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        tmdbId: selectedMovie?.id,
        title: title.trim(),
        posterUrl: selectedMovie?.posterUrl?.replace("/w200", "/w500") || null,
        genre: selectedMovie?.genres?.[0] || null,
        rating: rating > 0 ? rating : null,
        emotions,
        platform: platform || null,
        reviewText: reviewText.trim() || null,
        watchStatus,
        watchedAt: watchStatus === "WATCHED" ? new Date().toISOString() : null,
      };

      const res = await fetch("/api/watchlogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      addToast(
        watchStatus === "WATCHED"
          ? `"${title}" added to your journal! 🎬`
          : `"${title}" added to your watchlist!`,
        "success"
      );

      // Reset form
      setSelectedMovie(null);
      setManualTitle("");
      setRating(0);
      setEmotions([]);
      setPlatform("");
      setReviewText("");
      setWatchStatus("WATCHED");

      onSuccess?.();
    } catch {
      addToast("Failed to save entry. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-entry-form">
      <h2 className="add-entry-title">Log a Movie</h2>

      {/* Watch Status Toggle */}
      <div className="status-toggle">
        <button
          type="button"
          className={`status-toggle-btn ${watchStatus === "WATCHED" ? "active" : ""}`}
          onClick={() => setWatchStatus("WATCHED")}
        >
          ✅ Watched
        </button>
        <button
          type="button"
          className={`status-toggle-btn ${watchStatus === "TO_WATCH" ? "active" : ""}`}
          onClick={() => setWatchStatus("TO_WATCH")}
        >
          📋 To Watch
        </button>
      </div>

      {/* Movie Search */}
      <div className="form-section">
        <MovieSearch onSelect={handleMovieSelect} />
        {!selectedMovie && (
          <div className="manual-title">
            <span className="manual-title-or">or enter manually:</span>
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Movie title..."
              className="manual-title-input"
              id="manual-title"
            />
          </div>
        )}
      </div>

      {/* Selected Movie Preview */}
      {selectedMovie && (
        <div className="selected-movie-preview">
          {selectedMovie.posterUrl && (
            <img
              src={selectedMovie.posterUrl}
              alt={selectedMovie.title}
              className="preview-poster"
            />
          )}
          <div className="preview-info">
            <h3>{selectedMovie.title}</h3>
            <span className="preview-year">{selectedMovie.year}</span>
            {selectedMovie.genres.length > 0 && (
              <span className="preview-genres">
                {selectedMovie.genres.join(" · ")}
              </span>
            )}
            <button
              type="button"
              className="preview-clear"
              onClick={() => setSelectedMovie(null)}
            >
              Change movie
            </button>
          </div>
        </div>
      )}

      {/* Star Rating */}
      {watchStatus === "WATCHED" && (
        <>
          <div className="form-section">
            <label className="form-label">Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${
                    star <= (hoverRating || rating) ? "star-filled" : ""
                  }`}
                  onClick={() => setRating(star === rating ? 0 : star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="star-label">{rating}/5</span>
              )}
            </div>
          </div>

          {/* Feelings Panel */}
          <div className="form-section">
            <FeelingsPanel selected={emotions} onChange={setEmotions} />
          </div>

          {/* Platform */}
          <div className="form-section">
            <label htmlFor="platform" className="form-label">
              Where did you watch?
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="form-select"
            >
              <option value="">Select platform...</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Review */}
          <div className="form-section">
            <label htmlFor="review" className="form-label">
              Your thoughts (optional)
            </label>
            <textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you think about this movie?"
              className="form-textarea"
              rows={4}
              maxLength={5000}
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting
            ? "Saving..."
            : watchStatus === "WATCHED"
              ? "Log Movie"
              : "Add to Watchlist"}
        </button>
      </div>
    </form>
  );
}
