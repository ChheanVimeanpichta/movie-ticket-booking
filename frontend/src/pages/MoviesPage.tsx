import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Info, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { nowShowingGrid } from "@/data/movies";
import type { GridMovie } from "@/data/movies";

const GENRES = ["All", "Action", "Drama", "Sci-Fi", "Horror", "Animation"];
const FORMATS = ["Standard", "IMAX", "4DX"];

function MovieGridCard({ movie }: { movie: GridMovie }) {
  const navigate = useNavigate();
  return (
    <div className="group relative block">
      <Link
        to={`/movies/${movie.id}`}
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

        {movie.score != null && movie.score > 0 && (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-cine-red/90 px-2 py-1">
            <Star size={12} className="fill-white text-white" />
            <span className="font-mono text-xs font-bold text-white">
              {movie.score}
            </span>
          </div>
        )}

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
                navigate(`/select-screen/${movie.id}`);
              }}
              className="flex-1 inline-flex items-center justify-center rounded bg-cine-red px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-cine-red/80"
            >
              Book
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
          {movie.genre || "Now Showing"}
        </p>
      </div>
    </div>
  );
}

export default function MoviesPage() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [activeFormat, setActiveFormat] = useState("Standard");
  const [showAll, setShowAll] = useState(false);

  const filteredMovies = nowShowingGrid.filter((movie) => {
    const matchesGenre =
      activeGenre === "All" ||
      movie.genre
        .split("/")
        .some((g) => g.trim().toLowerCase() === activeGenre.toLowerCase());

    const matchesFormat =
      activeFormat === "Standard" || movie.badge === activeFormat;

    return matchesGenre && matchesFormat;
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

  return (
    <div className="min-h-screen bg-cine-bg">
      <Header />
      <main className="pb-16">
        <section className="px-4 pb-8 pt-16 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-cine-red">
            EXPLORE OUR COLLECTION
          </p>
          <h1 className="text-5xl font-black italic tracking-tighter text-white sm:text-6xl md:text-7xl">
            NOW SHOWING
          </h1>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-8">
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
