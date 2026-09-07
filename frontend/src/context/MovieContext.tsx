import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  nowShowing as defaultNowShowing,
  nowShowingGrid as defaultNowShowingGrid,
  Movie,
  GridMovie,
} from "@/data/movies";

interface MovieContextType {
  movies: GridMovie[];
  nowShowingList: Movie[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getMovieById: (id: string) => Movie | GridMovie | undefined;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<GridMovie[]>(defaultNowShowingGrid);
  const [nowShowingList, setNowShowingList] = useState<Movie[]>(defaultNowShowing);
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
        const mappedGrid: GridMovie[] = data.map((m: any) => ({
          id: m.id,
          title: m.title,
          genre: m.genre || "General",
          score: m.score !== null && m.score !== undefined ? Number(m.score) : null,
          poster: m.poster || "https://picsum.photos/seed/movie/300/450",
          badge: m.badge || undefined,
          extra: m.synopsis || "Now Showing in Cinemas",
          hasBookBtn: m.hasBookBtn ?? true,
        }));

        const mappedNowShowing: Movie[] = data.map((m: any) => ({
          id: m.id,
          title: m.title,
          genre: m.genre || "Action / Adventure",
          rating: "PG-13",
          runtime: m.durationMins ? `${Math.floor(m.durationMins / 60)}h ${m.durationMins % 60}m` : "2h 15m",
          score: m.score ? Number(m.score) : 8.0,
          poster: m.poster || "https://picsum.photos/seed/movie/300/450",
          landscape: m.poster || "https://picsum.photos/seed/movie/800/450",
          synopsis: m.synopsis || "Now showing exclusively at CineStar.",
          showtimes: ["12:30", "15:45", "19:00", "22:15"],
          releaseDate: m.releaseDate,
        }));

        setMovies(mappedGrid);
        setNowShowingList(mappedNowShowing);

        // Sync in-place so direct imports of nowShowingGrid/nowShowing get live data
        defaultNowShowingGrid.length = 0;
        defaultNowShowingGrid.push(...mappedGrid);

        defaultNowShowing.length = 0;
        defaultNowShowing.push(...mappedNowShowing);
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
        movies.find((m) => m.id === id) ||
        defaultNowShowing.find((m) => m.id === id) ||
        defaultNowShowingGrid.find((m) => m.id === id)
      );
    },
    [nowShowingList, movies]
  );

  return (
    <MovieContext.Provider
      value={{
        movies,
        nowShowingList,
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
