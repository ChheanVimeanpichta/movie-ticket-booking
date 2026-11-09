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
      const [res, scrRes] = await Promise.all([
        fetch(`${API_BASE_URL}/movies`).catch(() => null),
        fetch(`${API_BASE_URL}/screenings`).catch(() => null),
      ]);

      if (!res || !res.ok) {
        throw new Error(`Failed to fetch movies: ${res?.status || "network error"}`);
      }
      const data = await res.json();
      const screeningsData = scrRes && scrRes.ok ? await scrRes.json().catch(() => []) : [];

      if (Array.isArray(data) && data.length > 0) {
        const todayIso = new Date().toISOString().slice(0, 10);
        const todayScreeningCounts = new Map<string, number>();

        if (Array.isArray(screeningsData)) {
          screeningsData.forEach((s: any) => {
            const sDate = (s.date || s.screeningDate || "").trim().toLowerCase();
            const sTimeLabel = ((s as any).timeLabel || "").trim().toLowerCase();
            const isToday =
              sDate === todayIso ||
              sDate === "today" ||
              sTimeLabel === "today" ||
              sDate.startsWith(todayIso);

            if (isToday) {
              const mId = (s.movieId || "").toLowerCase();
              const mTitle = (s.title || s.movieTitle || "").toLowerCase();
              if (mId) todayScreeningCounts.set(mId, (todayScreeningCounts.get(mId) || 0) + 1);
              if (mTitle) todayScreeningCounts.set(mTitle, (todayScreeningCounts.get(mTitle) || 0) + 1);
            }
          });
        }

        // Distinct separation:
        // - Coming Soon: releaseDate is strictly in the future (> today)
        // - Now Showing: releaseDate is today or in the past (or not specified)
        const comingSoonData = data.filter((m: any) => isLaterThanToday(m.releaseDate));
        const nowShowingData = data.filter((m: any) => !isLaterThanToday(m.releaseDate));

        // Global movie catalog: contains ALL movies with distinct isComingSoon status
        const mappedGrid: GridMovie[] = data.map((m: any) => {
          const isComingSoon = isLaterThanToday(m.releaseDate);
          const normId = (m.id || "").toLowerCase();
          const normTitle = (m.title || "").toLowerCase();
          const showtimeCountToday =
            todayScreeningCounts.get(normId) ||
            todayScreeningCounts.get(normTitle) ||
            0;
          const hasShowtimeToday = !isComingSoon && showtimeCountToday > 0;
          const scoreNum =
            m.score !== null && m.score !== undefined && m.score !== "" && !isNaN(Number(m.score))
              ? Number(m.score)
              : null;
          const isRecommended = hasShowtimeToday || (scoreNum !== null && scoreNum >= 8.2);

          return {
            id: m.id,
            title: m.title,
            genre: m.genre || "General",
            score: scoreNum,
            poster: m.poster || "https://picsum.photos/seed/movie/300/450",
            badge: m.badge || undefined,
            extra: isComingSoon && m.releaseDate
              ? `Releasing ${new Date(m.releaseDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}`
              : hasShowtimeToday
              ? `★ Showing Today • ${showtimeCountToday} session${showtimeCountToday > 1 ? "s" : ""}`
              : (m.synopsis || "Now Showing in Cinemas"),
            hasBookBtn: !isComingSoon && (m.hasBookBtn ?? true),
            releaseDate: m.releaseDate,
            isComingSoon,
            hasShowtimeToday,
            isRecommended,
            showtimeCountToday,
          };
        });

        const mappedNowShowing: Movie[] = (nowShowingData.length > 0 ? nowShowingData : data).map((m: any) => {
          const normId = (m.id || "").toLowerCase();
          const normTitle = (m.title || "").toLowerCase();
          const showtimeCountToday =
            todayScreeningCounts.get(normId) ||
            todayScreeningCounts.get(normTitle) ||
            0;
          const hasShowtimeToday = showtimeCountToday > 0;
          const scoreNum =
            m.score !== null && m.score !== undefined && m.score !== "" && !isNaN(Number(m.score))
              ? Number(m.score)
              : null;
          const isRecommended = hasShowtimeToday || (scoreNum !== null && scoreNum >= 8.2);

          return {
            id: m.id,
            title: m.title,
            genre: m.genre || "Action / Adventure",
            rating: "PG-13",
            runtime: m.durationMins ? `${Math.floor(m.durationMins / 60)}h ${m.durationMins % 60}m` : "2h 15m",
            score: scoreNum,
            poster: m.poster || "https://picsum.photos/seed/movie/300/450",
            landscape: m.poster || "https://picsum.photos/seed/movie/800/450",
            synopsis: m.synopsis || "Now showing exclusively at CineStar.",
            showtimes: Array.isArray(m.showtimes)
              ? m.showtimes
              : Array.isArray(m.screenings)
              ? m.screenings.map((s: any) => s.time)
              : [],
            releaseDate: m.releaseDate,
            hasShowtimeToday,
            isRecommended,
            showtimeCountToday,
          };
        });

        // Sort Now Showing:
        // 1. Movies showing today first
        // 2. Higher score first
        mappedNowShowing.sort((a, b) => {
          if (a.hasShowtimeToday && !b.hasShowtimeToday) return -1;
          if (!a.hasShowtimeToday && b.hasShowtimeToday) return 1;
          const scoreA = a.score || 0;
          const scoreB = b.score || 0;
          return scoreB - scoreA;
        });

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

        // Sort mappedGrid:
        // 1. Now Showing before Coming Soon
        // 2. Movies showing today first (top recommendation)
        // 3. Recommended / Top score first
        mappedGrid.sort((a, b) => {
          if (Boolean(a.isComingSoon) !== Boolean(b.isComingSoon)) {
            return a.isComingSoon ? 1 : -1;
          }
          if (Boolean(a.hasShowtimeToday) !== Boolean(b.hasShowtimeToday)) {
            return a.hasShowtimeToday ? -1 : 1;
          }
          if (Boolean(a.isRecommended) !== Boolean(b.isRecommended)) {
            return a.isRecommended ? -1 : 1;
          }
          const scoreA = a.score || 0;
          const scoreB = b.score || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return a.title.localeCompare(b.title);
        });

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
