"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MovieCard from "@/components/library/MovieCard";
import { GridSkeleton } from "@/components/Skeleton";

interface WatchLog {
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

const PLATFORMS = [
  "Theater", "Netflix", "Prime Video", "Disney+",
  "HBO Max", "Apple TV+", "Hulu", "YouTube", "Local Media", "Other",
];

const EMOTIONS = [
  "Nostalgic", "Thrilled", "Tearjerker", "Heartwarming", "Mind-bending",
  "Suspenseful", "Comforting", "Disturbing", "Inspiring", "Hilarious",
];

export default function LibraryClient() {
  const [logs, setLogs] = useState<WatchLog[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters
  const [status, setStatus] = useState("");
  const [genre, setGenre] = useState("");
  const [emotion, setEmotion] = useState("");
  const [platform, setPlatform] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (status) params.set("status", status);
      if (genre) params.set("genre", genre);
      if (emotion) params.set("emotion", emotion);
      if (platform) params.set("platform", platform);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("limit", "20");

      const res = await fetch(`/api/watchlogs?${params}`);
      if (!res.ok) return { data: [], nextCursor: null };
      return res.json();
    },
    [status, genre, emotion, platform, sortBy, sortOrder]
  );

  // Initial fetch + refetch on filter change
  useEffect(() => {
    setIsLoading(true);
    setLogs([]);
    setNextCursor(null);

    fetchLogs().then((result) => {
      setLogs(result.data || []);
      setNextCursor(result.nextCursor);
      setIsLoading(false);
    });
  }, [fetchLogs]);

  // Infinite scroll via Intersection Observer
  useEffect(() => {
    if (!nextCursor || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          setIsLoadingMore(true);
          fetchLogs(nextCursor).then((result) => {
            setLogs((prev) => [...prev, ...(result.data || [])]);
            setNextCursor(result.nextCursor);
            setIsLoadingMore(false);
          });
        }
      },
      { threshold: 0.1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [nextCursor, isLoadingMore, fetchLogs]);

  return (
    <div className="library">
      <header className="library-header">
        <div className="library-header-row">
          <div>
            <h1>Your Library 📚</h1>
            <p className="library-subtitle">
              {logs.length} {logs.length === 1 ? "movie" : "movies"}
            </p>
          </div>
          <button
            className="btn btn-secondary filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "🔍 Filters"}
          </button>
        </div>
      </header>

      {/* Filters + Sort */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                <option value="">All</option>
                <option value="WATCHED">Watched</option>
                <option value="TO_WATCH">To Watch</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="form-select">
                <option value="">All</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Emotion</label>
              <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className="form-select">
                <option value="">All</option>
                {EMOTIONS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select">
                <option value="createdAt">Date Added</option>
                <option value="watchedAt">Date Watched</option>
                <option value="rating">Rating</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Order</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="form-select">
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <div className="filter-group filter-actions-group">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setStatus("");
                  setGenre("");
                  setEmotion("");
                  setPlatform("");
                  setSortBy("createdAt");
                  setSortOrder("desc");
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <GridSkeleton count={12} />
      ) : logs.length > 0 ? (
        <>
          <div className="movie-grid">
            {logs.map((log) => (
              <MovieCard
                key={log.id}
                id={log.id}
                title={log.title}
                posterUrl={log.posterUrl}
                rating={log.rating}
                emotions={log.emotions}
                platform={log.platform}
                watchedAt={log.watchedAt}
                genre={log.genre}
                watchStatus={log.watchStatus}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          {nextCursor && (
            <div ref={observerRef} className="load-more-sentinel">
              {isLoadingMore && (
                <div className="load-more-spinner">Loading more...</div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>
            {status || genre || emotion || platform
              ? "No movies match your filters."
              : "Your library is empty. Start logging movies to see them here!"}
          </p>
        </div>
      )}
    </div>
  );
}
