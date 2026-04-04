"use client";

import { useState } from "react";
import MovieSearch from "./MovieSearch";
import FeelingsPanel from "./FeelingsPanel";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

interface SearchResult {
  id: number;
  title: string;
  year: string;
  posterUrl: string | null;
  overview: string;
  genres: string[];
}

export interface WatchLogData {
  id?: string;
  tmdbId: number | null;
  title: string;
  posterUrl: string | null;
  genre: string | null;
  rating: number | null;
  emotions: string[];
  platform: string | null;
  reviewText: string | null;
  watchStatus: "WATCHED" | "TO_WATCH";
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
  initialData?: WatchLogData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddEntryForm({ initialData, onSuccess, onCancel }: AddEntryFormProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Movie data (from search or manual)
  const [selectedMovie, setSelectedMovie] = useState<SearchResult | null>(
    initialData?.tmdbId
      ? {
          id: initialData.tmdbId,
          title: initialData.title,
          year: "", // Not available directly from WatchLog
          posterUrl: initialData.posterUrl,
          overview: "",
          genres: initialData.genre ? [initialData.genre] : [],
        }
      : null
  );
  
  const [manualTitle, setManualTitle] = useState(
    initialData && !initialData.tmdbId ? initialData.title : ""
  );

  // User data
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [emotions, setEmotions] = useState<string[]>(initialData?.emotions || []);
  const [platform, setPlatform] = useState(initialData?.platform || "");
  const [reviewText, setReviewText] = useState(initialData?.reviewText || "");
  const [watchStatus, setWatchStatus] = useState<"WATCHED" | "TO_WATCH">(
    initialData?.watchStatus || "WATCHED"
  );

  // Custom Poster Upload
  const [customPosterUrl, setCustomPosterUrl] = useState<string | null>(
    initialData?.posterUrl || null
  );
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  const handleMovieSelect = (movie: SearchResult) => {
    setSelectedMovie(movie);
    setManualTitle("");
    setCustomPosterUrl(null); // Reset custom poster when a new TMDb movie is selected
  };

  const activeTitle = selectedMovie?.title || manualTitle;
  const activePoster = customPosterUrl || selectedMovie?.posterUrl?.replace("/w200", "/w500") || null;

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPoster(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setCustomPosterUrl(data.url);
      addToast("Poster uploaded successfully!", "success");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to upload poster",
        "error"
      );
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTitle.trim()) {
      addToast("Please select or enter a movie title", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        tmdbId: selectedMovie?.id,
        title: activeTitle.trim(),
        posterUrl: activePoster,
        genre: selectedMovie?.genres?.[0] || null,
        rating: rating > 0 ? rating : null,
        emotions,
        platform: platform || null,
        reviewText: reviewText.trim() || null,
        watchStatus,
        watchedAt: watchStatus === "WATCHED" && (!initialData || initialData.watchStatus !== "WATCHED") 
          ? new Date().toISOString() 
          : undefined, // Keep existing watchedAt if it's already watched
      };

      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/watchlogs/${initialData.id}` : "/api/watchlogs";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      addToast(
        initialData 
          ? `"${activeTitle}" updated successfully!`
          : watchStatus === "WATCHED"
            ? `"${activeTitle}" added to your journal! 🎬`
            : `"${activeTitle}" added to your watchlist!`,
        "success"
      );

      if (!initialData) {
        // Reset form only if adding new entry
        setSelectedMovie(null);
        setManualTitle("");
        setRating(0);
        setEmotions([]);
        setPlatform("");
        setReviewText("");
        setCustomPosterUrl(null);
        setWatchStatus("WATCHED");
      }

      onSuccess?.();
    } catch {
      addToast("Failed to save entry. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-entry-form">
      <h2 className="add-entry-title">
        {initialData ? "Edit Entry" : "Log a Movie"}
      </h2>

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
        {!initialData && <MovieSearch onSelect={handleMovieSelect} />}
        {(!selectedMovie || initialData) && (
          <div className="manual-title">
            {!initialData && <span className="manual-title-or">or enter manually:</span>}
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => {
                setManualTitle(e.target.value);
                if (selectedMovie) setSelectedMovie(null); // Unlink TMDb if manual override
              }}
              placeholder="Movie title..."
              className="manual-title-input"
              id="manual-title"
              required={!selectedMovie}
            />
          </div>
        )}
      </div>

      {/* Selected Movie Preview & Custom Poster */}
      {(selectedMovie || manualTitle) && (
        <div className="selected-movie-preview">
          <div className="poster-container">
            {isUploadingPoster ? (
              <Skeleton variant="rect" className="preview-poster" />
            ) : activePoster ? (
              <img
                src={activePoster}
                alt={activeTitle}
                className="preview-poster"
              />
            ) : (
              <div className="preview-poster-placeholder">No Poster</div>
            )}
            
            <label className="upload-btn poster-upload-btn" title="Upload Custom Poster">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden-input"
                onChange={handlePosterUpload}
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </label>
          </div>

          <div className="preview-info">
            <h3>{activeTitle}</h3>
            {selectedMovie && <span className="preview-year">{selectedMovie.year}</span>}
            {selectedMovie?.genres?.length ? (
              <span className="preview-genres">
                {selectedMovie.genres.join(" · ")}
              </span>
            ) : null}
            {!initialData && selectedMovie && (
              <button
                type="button"
                className="preview-clear"
                onClick={() => {
                  setSelectedMovie(null);
                  setCustomPosterUrl(null);
                }}
              >
                Change movie
              </button>
            )}
            {customPosterUrl && (
              <button
                type="button"
                className="preview-clear"
                onClick={() => setCustomPosterUrl(null)}
                style={{ marginTop: '0.5rem' }}
              >
                Remove custom poster
              </button>
            )}
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
          disabled={isSubmitting || !activeTitle.trim() || isUploadingPoster}
        >
          {isSubmitting
            ? "Saving..."
            : initialData 
              ? "Update Entry" 
              : watchStatus === "WATCHED"
                ? "Log Movie"
                : "Add to Watchlist"}
        </button>
      </div>
    </form>
  );
}
