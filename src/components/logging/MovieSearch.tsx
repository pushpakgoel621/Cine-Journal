"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface SearchResult {
  id: number;
  title: string;
  year: string;
  posterUrl: string | null;
  overview: string;
  genres: string[];
}

interface MovieSearchProps {
  onSelect: (movie: SearchResult) => void;
}

export default function MovieSearch({ onSelect }: MovieSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/search?q=${encodeURIComponent(q.trim())}`
      );
      const data = await res.json();
      setResults(data.results || []);
      setIsOpen(data.results?.length > 0);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      search(value);
    }, 300);
  };

  const handleSelect = (movie: SearchResult) => {
    setQuery(movie.title);
    setIsOpen(false);
    setResults([]);
    onSelect(movie);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="movie-search" ref={containerRef}>
      <div className="movie-search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a movie..."
          className="movie-search-input"
          autoComplete="off"
          id="movie-search"
        />
        {isLoading && <span className="movie-search-spinner" />}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="movie-search-dropdown" role="listbox">
          {results.map((movie, index) => (
            <li
              key={movie.id}
              className={`movie-search-item ${
                index === selectedIndex ? "movie-search-item-active" : ""
              }`}
              onClick={() => handleSelect(movie)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="movie-search-thumb">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    width={40}
                    height={60}
                  />
                ) : (
                  <div className="movie-search-no-poster">🎬</div>
                )}
              </div>
              <div className="movie-search-info">
                <span className="movie-search-title">{movie.title}</span>
                <span className="movie-search-year">{movie.year}</span>
                {movie.genres.length > 0 && (
                  <span className="movie-search-genres">
                    {movie.genres.slice(0, 2).join(" · ")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
