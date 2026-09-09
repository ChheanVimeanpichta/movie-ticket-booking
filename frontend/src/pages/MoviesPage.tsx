import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Star, Info, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { nowShowingGrid } from "@/data/movies";
import type { GridMovie } from "@/data/movies";
import { useMovies } from "@/context/MovieContext";

const STATUSES = ["Now Showing", "Coming Soon", "All"] as const;
const GENRES = ["All", "Action", "Drama", "Sci-Fi", "Horror", "Animation"];
const FORMATS = ["Standard", "IMAX", "4DX"];

function MovieGridCard({ movie }: { movie: GridMovie }) {
  const navigate = useNavigate();
  const isComingSoon = Boolean(movie.isComingSoon);
  const targetUrl = isComingSoon ? `/coming-soon/${movie.id}` : `/select-screen/${movie.id}`;

  return (
    <div className="group relative block">
      <Link
        to={targetUrl}
        className="relative block overflow-hidden rounded bg-cine-card"
      >
        <div className="aspect-[3/4] w-full">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        {isComingSoon && movie.releaseDate ? (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded bg-cine-red/90 px-2 py-1 shadow">
            <Calendar size={11} className="text-white" />
            <span className="font-mono text-xs font-bold uppercase text-white">
              {movie.releaseDate}
            </span>
          </div>
        ) : movie.score != null && movie.score > 0 ? (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-cine-red/90 px-2 py-1 shadow">
            <Star size={12} className="fill-white text-white" />
            <span className="font-mono text-xs font-bold text-white">
              {movie.score}
            </span>
          </div>
        ) : null}

        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div />
          <div>
            {movie.genre && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-cine-pink">
                {movie.genre}
              </p>
            )}
            <p className="mt-1 text-sm font-bold leading-tight text-white">
              {movie.title}
            </p>
            {movie.extra && (
              <p className="mt-1 text-xs text-cine-text-light">
                {movie.extra}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(targetUrl);
              }}
              className="flex-1 inline-flex items-center justify-center rounded bg-cine-red px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-cine-red/80"
            >
              {isComingSoon ? "Details" : "Book"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(targetUrl);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white/80 transition-colors hover:border-white hover:text-white"
            >
              <Info size={15} />
            </button>
          </div>
        </div>
      </Link>

      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-semibold text-cine-white transition-colors group-hover:text-cine-red">
          {movie.title}
        </p>
        <p className="text-xs text-cine-text">
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
      : searchParams.get("status") === "all"
        ? "All"
        : "Now Showing";
  const [activeStatus, setActiveStatus] = useState<string>(initialStatus);
  const [activeGenre, setActiveGenre] = useState("All");
  const [activeFormat, setActiveFormat] = useState("Standard");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const s = searchParams.get("status");
    if (s === "coming-soon") setActiveStatus("Coming Soon");
    else if (s === "all") setActiveStatus("All");
    else if (s === "now-showing") setActiveStatus("Now Showing");
  }, [searchParams]);

  const moviesList = movies && movies.length > 0 ? movies : nowShowingGrid;

  const filteredMovies = moviesList.filter((movie) => {
    const matchesStatus =
      activeStatus === "All" ||
      (activeStatus === "Coming Soon" ? Boolean(movie.isComingSoon) : !movie.isComingSoon);

    const matchesGenre =
      activeGenre === "All" ||
      movie.genre
        .split("/")
        .some((g) => g.trim().toLowerCase() === activeGenre.toLowerCase());

    const matchesFormat =
      activeFormat === "Standard" || movie.badge === activeFormat;

    return matchesStatus && matchesGenre && matchesFormat;
  });

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
      : activeStatus === "Now Showing"
        ? "NOW IN THEATERS"
        : "EXPLORE OUR COLLECTION";
  const title =
    activeStatus === "Coming Soon"
      ? "COMING SOON"
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

        <div className="mx-auto max-w-7xl px-4 pb-8">
          {/* Status Tabs: All / Now Showing / Coming Soon */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full bg-surface-variant/40 p-1 border border-white/10">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setActiveStatus(status);
                    setShowAll(false);
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeStatus === status
                      ? "bg-cine-red text-white shadow-lg shadow-cine-red/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4">
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayedMovies.map((movie) => (
                <MovieGridCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-gray-500">
              No movies match the selected filters.
            </p>
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
