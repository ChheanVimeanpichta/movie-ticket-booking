import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Star, Info, Calendar, ChevronDown, ChevronUp, Sparkles, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { nowShowingGrid } from "@/data/movies";
import type { GridMovie } from "@/data/movies";
import { useMovies } from "@/context/MovieContext";

const STATUSES = ["Now Showing", "Showing Today", "Coming Soon", "All"] as const;
const GENRES = ["All", "Action", "Drama", "Sci-Fi", "Horror", "Animation"];
const FORMATS = ["Standard", "IMAX", "4DX"];
type SortOption = "recommended" | "rating" | "az";

function MovieGridCard({ movie }: { movie: GridMovie }) {
  const navigate = useNavigate();
  const isComingSoon = Boolean(movie.isComingSoon);
  const targetUrl = isComingSoon ? `/coming-soon/${movie.id}` : `/select-screen/${movie.id}`;

  return (
    <div className="group relative block">
      <Link
        to={targetUrl}
        className="relative block overflow-hidden rounded bg-cine-card transition-all duration-300 hover:shadow-xl hover:shadow-black/60"
      >
        <div className="aspect-[3/4] w-full overflow-hidden">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Top Left Badge: Score or Release Date */}
        {isComingSoon && movie.releaseDate ? (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded bg-cine-red/90 px-2 py-1 shadow backdrop-blur-xs">
            <Calendar size={11} className="text-white" />
            <span className="font-mono text-xs font-bold uppercase text-white">
              {movie.releaseDate}
            </span>
          </div>
        ) : movie.score != null && movie.score > 0 ? (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-black/75 border border-white/20 px-2 py-1 shadow backdrop-blur-xs">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="font-mono text-xs font-bold text-white">
              {movie.score}
            </span>
          </div>
        ) : null}

        {/* Top Right Badge: Showing Today / Recommended / Format */}
        {movie.hasShowtimeToday ? (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-emerald-600/90 border border-emerald-400/40 px-2.5 py-1 shadow-md backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
              Showing Today
            </span>
          </div>
        ) : movie.isRecommended && !isComingSoon ? (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 border border-amber-300/40 px-2 py-0.5 shadow-md backdrop-blur-xs">
            <Sparkles size={10} className="fill-white text-white" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
              Top Pick
            </span>
          </div>
        ) : movie.badge ? (
          <div className="absolute right-2 top-2 z-10 rounded bg-white/20 border border-white/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
            {movie.badge}
          </div>
        ) : null}

        {/* Hover Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex justify-end">
            {movie.badge && movie.hasShowtimeToday && (
              <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                {movie.badge}
              </span>
            )}
          </div>
          <div>
            {movie.genre && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-cine-pink">
                {movie.genre}
              </p>
            )}
            <p className="mt-1 text-sm font-bold leading-tight text-white">
              {movie.title}
            </p>
            {movie.hasShowtimeToday ? (
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                {movie.showtimeCountToday && movie.showtimeCountToday > 0
                  ? `${movie.showtimeCountToday} showtimes today`
                  : "Showing today"}
              </p>
            ) : movie.isRecommended && !isComingSoon ? (
              <p className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                <Sparkles size={11} className="fill-amber-300 text-amber-300" />
                Recommended pick
              </p>
            ) : movie.extra ? (
              <p className="mt-1 text-xs text-cine-text-light line-clamp-2">
                {movie.extra}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(targetUrl);
              }}
              className="flex-1 inline-flex items-center justify-center rounded bg-cine-red px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-cine-red/80 shadow-md shadow-cine-red/20"
            >
              {isComingSoon ? "Details" : "Book Ticket"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(targetUrl);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white/80 transition-colors hover:border-white hover:text-white"
              title={isComingSoon ? "Details" : "Select Showtime"}
            >
              <Info size={15} />
            </button>
          </div>
        </div>
      </Link>

      <div className="mt-2 px-0.5">
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-sm font-semibold text-cine-white transition-colors group-hover:text-cine-red">
            {movie.title}
          </p>
          {movie.hasShowtimeToday ? (
            <span className="shrink-0 rounded bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase text-emerald-400">
              Today
            </span>
          ) : movie.isRecommended && !isComingSoon ? (
            <span className="shrink-0 rounded bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-400">
              Pick
            </span>
          ) : null}
        </div>
        <p className="text-xs text-cine-text truncate mt-0.5">
          {movie.genre || (isComingSoon ? "Coming Soon" : "Now Showing")}
        </p>
      </div>
    </div>
  );
}

export default function MoviesPage() {
  const { movies, loading } = useMovies();
  const [searchParams] = useSearchParams();
  const initialStatus =
    searchParams.get("status") === "coming-soon"
      ? "Coming Soon"
      : searchParams.get("status") === "showing-today" || searchParams.get("status") === "today"
        ? "Showing Today"
        : searchParams.get("status") === "all"
          ? "All"
          : "Now Showing";
  const [activeStatus, setActiveStatus] = useState<string>(initialStatus);
  const [activeGenre, setActiveGenre] = useState("All");
  const [activeFormat, setActiveFormat] = useState("Standard");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const s = searchParams.get("status");
    if (s === "coming-soon") setActiveStatus("Coming Soon");
    else if (s === "showing-today" || s === "today") setActiveStatus("Showing Today");
    else if (s === "all") setActiveStatus("All");
    else if (s === "now-showing") setActiveStatus("Now Showing");
  }, [searchParams]);

  const moviesList = movies && movies.length > 0 ? movies : nowShowingGrid;

  const filteredMovies = useMemo(() => {
    const list = moviesList.filter((movie) => {
      const matchesStatus =
        activeStatus === "All" ||
        (activeStatus === "Showing Today"
          ? !movie.isComingSoon && Boolean(movie.hasShowtimeToday)
          : activeStatus === "Coming Soon"
          ? Boolean(movie.isComingSoon)
          : !movie.isComingSoon);

      const matchesGenre =
        activeGenre === "All" ||
        movie.genre
          .split("/")
          .some((g) => g.trim().toLowerCase() === activeGenre.toLowerCase());

      const matchesFormat =
        activeFormat === "Standard" || movie.badge === activeFormat;

      return matchesStatus && matchesGenre && matchesFormat;
    });

    return list.sort((a, b) => {
      if (sortBy === "recommended") {
        // 1. Showing today first (top recommendation)
        const aToday = Boolean(a.hasShowtimeToday);
        const bToday = Boolean(b.hasShowtimeToday);
        if (aToday !== bToday) return aToday ? -1 : 1;

        // 2. Recommended badge
        const aRec = Boolean(a.isRecommended);
        const bRec = Boolean(b.isRecommended);
        if (aRec !== bRec) return aRec ? -1 : 1;

        // 3. Higher rating/score
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;

        return a.title.localeCompare(b.title);
      }
      if (sortBy === "rating") {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "az") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [moviesList, activeStatus, activeGenre, activeFormat, sortBy]);

  const displayedMovies = showAll ? filteredMovies : filteredMovies.slice(0, 10);

  function handleGenreClick(genre: string) {
    setActiveGenre(genre);
    setShowAll(false);
  }

  function handleFormatClick(format: string) {
    setActiveFormat(format);
    setShowAll(false);
  }

  const subtitle =
    activeStatus === "Coming Soon"
      ? "NEXT ON SCREEN"
      : activeStatus === "Showing Today"
        ? "EXPERIENCE TODAY"
        : activeStatus === "Now Showing"
          ? "NOW IN THEATERS • TOP PICKS"
          : "EXPLORE OUR COLLECTION";
  const title =
    activeStatus === "Coming Soon"
      ? "COMING SOON"
      : activeStatus === "Showing Today"
        ? "SHOWING TODAY"
        : activeStatus === "Now Showing"
          ? "NOW SHOWING"
          : "ALL MOVIES";

  return (
    <div className="min-h-screen bg-cine-bg">
      <Header />
      <main className="pb-16">
        <section className="px-4 pb-4 pt-16 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-cine-red">
            {subtitle}
          </p>
          <h1 className="text-5xl font-black italic tracking-tighter text-white sm:text-6xl md:text-7xl">
            {title}
          </h1>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-8 space-y-5">
          {/* Status Tabs: Now Showing / Showing Today / Coming Soon / All */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-surface-variant/40 p-1 border border-white/10 flex-wrap justify-center gap-1">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setActiveStatus(status);
                    setShowAll(false);
                  }}
                  className={`relative rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    activeStatus === status
                      ? "bg-cine-red text-white shadow-lg shadow-cine-red/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>{status}</span>
                  {status === "Showing Today" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Filters: Genre, Format, and Sort By */}
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Genre Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeGenre === genre
                      ? "bg-cine-red text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Format Filter */}
              <div className="flex overflow-hidden rounded-full border border-gray-700">
                {FORMATS.map((format) => (
                  <button
                    key={format}
                    onClick={() => handleFormatClick(format)}
                    className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      activeFormat === format
                        ? "bg-cine-red text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>

              {/* Sort By Filter */}
              <div className="flex items-center gap-1.5 rounded-full border border-gray-700 bg-gray-900/70 p-1 text-xs">
                <span className="pl-2 pr-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <SlidersHorizontal size={12} />
                  Sort:
                </span>
                <button
                  onClick={() => setSortBy("recommended")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-colors ${
                    sortBy === "recommended"
                      ? "bg-cine-red text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Shows today first, followed by top picks"
                >
                  Recommended
                </button>
                <button
                  onClick={() => setSortBy("rating")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-colors ${
                    sortBy === "rating"
                      ? "bg-cine-red text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Top Rated
                </button>
                <button
                  onClick={() => setSortBy("az")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-colors ${
                    sortBy === "az"
                      ? "bg-cine-red text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  A - Z
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400 animate-pulse">
              Loading movies and today's schedule...
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayedMovies.map((movie) => (
                <MovieGridCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-base font-semibold text-cine-white">
                {activeStatus === "Showing Today"
                  ? "No movies currently showing today with the selected genre or format."
                  : "No movies match the selected filters."}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Try switching to{" "}
                <button
                  onClick={() => {
                    setActiveStatus("Now Showing");
                    setActiveGenre("All");
                    setActiveFormat("Standard");
                  }}
                  className="text-cine-red underline hover:text-cine-red/80 font-bold"
                >
                  All Now Showing Movies
                </button>
                .
              </p>
            </div>
          )}
        </div>

        {filteredMovies.length >= 10 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="rounded-full bg-gray-800 px-8 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              {showAll ? <>Show Less <ChevronUp size={16} className="inline" /></> : <>Show More <ChevronDown size={16} className="inline" /></>}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
