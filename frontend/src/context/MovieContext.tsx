import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  nowShowing as defaultNowShowing,
  nowShowingGrid as defaultNowShowingGrid,
  comingSoon as defaultComingSoon,
  Movie,
  GridMovie,
} from "@/data/movies";

interface MovieContextType {
  movies: GridMovie[];
  nowShowingList: Movie[];
  comingSoonList: Movie[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getMovieById: (id: string) => Movie | GridMovie | undefined;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function isLaterThanToday(releaseDate?: string | null): boolean {
  if (!releaseDate) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = releaseDate.split("-");
    let target: Date;
    if (parts.length === 3) {
      target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      target = new Date(releaseDate);
    }

    if (!isNaN(target.getTime())) {
      target.setHours(0, 0, 0, 0);
      return target.getTime() > today.getTime();
    }
  } catch {}
  return false;
}

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<GridMovie[]>(defaultNowShowingGrid);
  const [nowShowingList, setNowShowingList] = useState<Movie[]>(defaultNowShowing);
  const [comingSoonList, setComingSoonList] = useState<Movie[]>(defaultComingSoon);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies`);
      if (!res.ok) {
        throw new Error(`Failed to fetch movies: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Distinct separation:
        // - Coming Soon: releaseDate is strictly in the future (> today)
        // - Now Showing: releaseDate is today or in the past (or not specified)
        const comingSoonData = data.filter((m: any) => isLaterThanToday(m.releaseDate));
        const nowShowingData = data.filter((m: any) => !isLaterThanToday(m.releaseDate));

        // Global movie catalog: contains ALL movies with distinct isComingSoon status
        const mappedGrid: GridMovie[] = data.map((m: any) => {
          const isComingSoon = isLaterThanToday(m.releaseDate);
          return {
            id: m.id,
            title: m.title,
            genre: m.genre || "General",
            score: m.score !== null && m.score !== undefined && m.score !== "" && !isNaN(Number(m.score)) ? Number(m.score) : null,
            poster: m.poster || "https://picsum.photos/seed/movie/300/450",
            badge: m.badge || undefined,
            extra: isComingSoon && m.releaseDate
              ? `Releasing ${new Date(m.releaseDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}`
              : (m.synopsis || "Now Showing in Cinemas"),
            hasBookBtn: !isComingSoon && (m.hasBookBtn ?? true),
            releaseDate: m.releaseDate,
            isComingSoon,
          };
        });

        const mappedNowShowing: Movie[] = (nowShowingData.length > 0 ? nowShowingData : data).map((m: any) => ({
          id: m.id,
          title: m.title,
          genre: m.genre || "Action / Adventure",
          rating: "PG-13",
          runtime: m.durationMins ? `${Math.floor(m.durationMins / 60)}h ${m.durationMins % 60}m` : "2h 15m",
          score: m.score !== null && m.score !== undefined && m.score !== "" && !isNaN(Number(m.score)) ? Number(m.score) : null,
          poster: m.poster || "https://picsum.photos/seed/movie/300/450",
          landscape: m.poster || "https://picsum.photos/seed/movie/800/450",
          synopsis: m.synopsis || "Now showing exclusively at CineStar.",
          showtimes: ["12:30", "15:45", "19:00", "22:15"],
          releaseDate: m.releaseDate,
        }));

        const mappedComingSoon: Movie[] = comingSoonData.map((m: any) => ({
          id: m.id,
          title: m.title,
          genre: m.genre || "Coming Soon",
          rating: "PG-13",
          runtime: m.durationMins ? `${Math.floor(m.durationMins / 60)}h ${m.durationMins % 60}m` : "2h 00m",
          score: m.score !== null && m.score !== undefined && m.score !== "" && !isNaN(Number(m.score)) ? Number(m.score) : null,
          poster: m.poster || "https://picsum.photos/seed/movie/400/600",
          landscape: m.poster || "https://picsum.photos/seed/movie/800/450",
          synopsis: m.synopsis || "Releasing soon exclusively at CineStar.",
          showtimes: [],
          releaseDate: m.releaseDate ? new Date(m.releaseDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : undefined,
        }));

        const resolvedComingSoon = mappedComingSoon.length > 0
          ? [...mappedComingSoon, ...defaultComingSoon.filter((def) => !mappedComingSoon.some((b) => b.id === def.id))]
          : defaultComingSoon;

        setMovies(mappedGrid);
        setNowShowingList(mappedNowShowing);
        setComingSoonList(resolvedComingSoon);

        // Sync in-place so direct imports of nowShowingGrid/nowShowing/comingSoon get live data
        defaultNowShowingGrid.length = 0;
        defaultNowShowingGrid.push(...mappedGrid);

        defaultNowShowing.length = 0;
        defaultNowShowing.push(...mappedNowShowing);

        defaultComingSoon.length = 0;
        defaultComingSoon.push(...resolvedComingSoon);

        setError(null);
      }
    } catch (err: any) {
      console.warn("[MovieContext] Failed to fetch movies from backend, using defaults:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();

    // Auto-sync every 6 seconds so customer screen updates live when admin edits/adds movies
    const interval = setInterval(fetchMovies, 6000);

    const onFocus = () => fetchMovies();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchMovies]);

  const getMovieById = useCallback(
    (id: string) => {
      return (
        nowShowingList.find((m) => m.id === id) ||
        comingSoonList.find((m) => m.id === id) ||
        movies.find((m) => m.id === id) ||
        defaultNowShowing.find((m) => m.id === id) ||
        defaultComingSoon.find((m) => m.id === id) ||
        defaultNowShowingGrid.find((m) => m.id === id)
      );
    },
    [nowShowingList, comingSoonList, movies]
  );

  return (
    <MovieContext.Provider
      value={{
        movies,
        nowShowingList,
        comingSoonList,
        loading,
        error,
        refetch: fetchMovies,
        getMovieById,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovies must be used within a MovieProvider");
  }
  return context;
};
